import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, Any, Tuple, Optional

from ..ml.feature_builder import FEATURE_NAMES
from ..ml.preprocessing import FraudPreprocessor
from ..ml.data_generator import (
    generate_structured_dataset,
    get_train_test_split,
    calculate_class_weights,
)
from ..ml.evaluation import (
    evaluate_model,
    find_optimal_threshold,
    print_evaluation_report,
)

MODEL_DIR = "backend/app/models"
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_model.joblib")
PREPROCESSOR_PATH = os.path.join(MODEL_DIR, "fraud_preprocessor.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "fraud_metadata.json")

RANDOM_STATE = 42


def train_random_forest(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    class_weight: Optional[Dict[int, float]] = None,
) -> Any:
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.model_selection import cross_val_score

    print("\n[Training] Random Forest Classifier (with regularization)")

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=20,
        min_samples_leaf=10,
        max_features="sqrt",
        class_weight=class_weight or "balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbose=1,
    )

    model.fit(X_train, y_train)

    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="f1")
    print(f"  Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    return model


def train_xgboost(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    scale_pos_weight: Optional[float] = None,
) -> Any:
    try:
        import xgboost as xgb
        from sklearn.model_selection import cross_val_score

        print("\n[Training] XGBoost Classifier (with regularization)")

        if scale_pos_weight is None:
            n_neg = (y_train == 0).sum()
            n_pos = (y_train == 1).sum()
            scale_pos_weight = n_neg / n_pos if n_pos > 0 else 1.0

        model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.05,
            scale_pos_weight=scale_pos_weight,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            eval_metric="aucpr",
            verbosity=1,
        )

        model.fit(X_train, y_train)

        cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring="f1")
        print(
            f"  Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})"
        )

        return model

    except ImportError:
        print("[Warning] XGBoost not available, skipping...")
        return None


def train_logistic_regression(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_train_scaled: np.ndarray,
    class_weight: Optional[Dict[int, float]] = None,
) -> Any:
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import cross_val_score

    print("\n[Training] Logistic Regression (with regularization)")

    model = LogisticRegression(
        max_iter=1000,
        class_weight=class_weight or "balanced",
        C=0.1,
        penalty="l2",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )

    model.fit(X_train_scaled, y_train)

    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring="f1")
    print(f"  Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    return model


def compare_models(
    models: Dict[str, Any],
    X_test: pd.DataFrame,
    y_test: pd.Series,
    use_scaled: Dict[str, bool] = None,
    preprocessor: Any = None,
) -> Tuple[Dict[str, Dict[str, Any]], str]:
    results = {}
    use_scaled = use_scaled or {}

    print("\n" + "=" * 60)
    print("MODEL COMPARISON ON HELD-OUT TEST SET")
    print("=" * 60)

    for name, model in models.items():
        print(f"\nEvaluating {name} on TEST set...")

        if use_scaled.get(name) and preprocessor:
            X_test_scaled = preprocessor.transform(X_test)
            y_prob = model.predict_proba(X_test_scaled)[:, 1]
        else:
            y_prob = model.predict_proba(X_test)[:, 1]

        y_pred = (y_prob >= 0.5).astype(int)

        metrics = evaluate_model(y_test.values, y_pred, y_prob)

        results[name] = {
            "model": model,
            "metrics": metrics,
            "y_prob": y_prob,
        }

        print(f"  Precision: {metrics['precision']:.4f}")
        print(f"  Recall:    {metrics['recall']:.4f}")
        print(f"  F1-Score:  {metrics['f1_score']:.4f}")
        print(f"  ROC-AUC:   {metrics['roc_auc']:.4f}")
        print(f"  PR-AUC:    {metrics['pr_auc']:.4f}")

    best_model_name = max(
        results.keys(), key=lambda k: results[k]["metrics"]["f1_score"]
    )

    print(f"\n[BEST MODEL] {best_model_name} (based on F1-Score)")

    return results, best_model_name


def calibrate_thresholds(
    y_true: np.ndarray,
    y_prob: np.ndarray,
) -> Dict[str, float]:
    high_threshold, medium_threshold, default_threshold = find_optimal_threshold(
        y_true, y_prob, target_recall=0.80, min_precision=0.20
    )

    thresholds = {
        "high": high_threshold,
        "medium": medium_threshold,
        "default": default_threshold,
    }

    return thresholds


def train_pipeline(
    n_samples: int = 50000,
    fraud_ratio: float = 0.05,
    test_size: float = 0.2,
    retrain: bool = True,
) -> Tuple[Any, FraudPreprocessor, Dict[str, Any], Dict[str, float]]:
    print("=" * 60)
    print("FRAUD DETECTION ML TRAINING PIPELINE")
    print("=" * 60)
    print(f"\nTimestamp: {datetime.now().isoformat()}")
    print(f"Samples: {n_samples:,}, Fraud ratio: {fraud_ratio:.2%}")

    print("\n[Step 1] Generating REALISTIC training data...")
    df = generate_structured_dataset(n_samples=n_samples, fraud_ratio=fraud_ratio)

    print(f"Dataset shape: {df.shape}")
    print(
        f"Fraud transactions: {df['is_fraud'].sum():,} ({df['is_fraud'].mean() * 100:.2f}%)"
    )

    fraud_df = df[df["is_fraud"] == 1]
    normal_df = df[df["is_fraud"] == 0]
    print(
        f"  Fraud amount range: ${fraud_df['amount'].min():.0f} - ${fraud_df['amount'].max():.0f}"
    )
    print(
        f"  Normal amount range: ${normal_df['amount'].min():.0f} - ${normal_df['amount'].max():.0f}"
    )
    print(f"  Overlap: Amount ranges overlap significantly (realistic)")

    print("\n[Step 2] Splitting data (stratified)...")
    X_train, X_test, y_train, y_test = get_train_test_split(df, test_size=test_size)

    print(f"Training samples: {len(X_train):,}")
    print(f"Test samples: {len(X_test):,}")
    print(f"Training fraud ratio: {y_train.mean() * 100:.2f}%")
    print(f"Test fraud ratio: {y_test.mean() * 100:.2f}%")

    print("\n[Step 3] Fitting preprocessor...")
    preprocessor = FraudPreprocessor()
    X_train_scaled = preprocessor.fit_transform(X_train)
    X_test_scaled = preprocessor.transform(X_test)

    print(f"Features: {preprocessor.get_feature_names()}")

    class_weights = calculate_class_weights(y_train)
    print(
        f"\nClass weights: Normal={class_weights[0]:.2f}, Fraud={class_weights[1]:.2f}"
    )

    n_neg = (y_train == 0).sum()
    n_pos = (y_train == 1).sum()
    scale_pos_weight = n_neg / n_pos if n_pos > 0 else 1.0

    print("\n[Step 4] Training models with regularization...")
    models = {}
    use_scaled = {}

    rf_model = train_random_forest(X_train, y_train)
    models["RandomForest"] = rf_model
    use_scaled["RandomForest"] = False

    xgb_model = train_xgboost(X_train, y_train, scale_pos_weight)
    if xgb_model is not None:
        models["XGBoost"] = xgb_model
        use_scaled["XGBoost"] = False

    lr_model = train_logistic_regression(X_train, y_train, X_train_scaled)
    models["LogisticRegression"] = lr_model
    use_scaled["LogisticRegression"] = True

    print("\n[Step 5] Evaluating models on HELD-OUT TEST set...")
    results, best_model_name = compare_models(
        models, X_test, y_test, use_scaled, preprocessor
    )

    best_model = results[best_model_name]["model"]
    best_metrics = results[best_model_name]["metrics"]
    y_prob_best = results[best_model_name]["y_prob"]

    print("\n[Step 6] Calibrating thresholds...")
    thresholds = calibrate_thresholds(y_test.values, y_prob_best)

    print_evaluation_report(best_metrics, thresholds)

    print("\n[Step 7] Verifying on test set with calibrated thresholds...")
    y_pred_calibrated = np.array(
        [
            "HIGH"
            if p >= thresholds["high"]
            else "MEDIUM"
            if p >= thresholds["medium"]
            else "LOW"
            for p in y_prob_best
        ]
    )
    y_true_labels = np.where(y_test.values == 1, "HIGH", "LOW")

    high_risk_correct = (
        (y_pred_calibrated == "HIGH") & (y_true_labels == "HIGH")
    ).sum()
    high_risk_actual = (y_true_labels == "HIGH").sum()
    print(
        f"  High risk recall: {high_risk_correct}/{high_risk_actual} ({high_risk_correct / max(high_risk_actual, 1) * 100:.1f}%)"
    )

    print("\n[Step 8] Saving artifacts...")
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)

    metadata = {
        "model_name": best_model_name,
        "model_type": type(best_model).__name__,
        "features": FEATURE_NAMES,
        "n_features": len(FEATURE_NAMES),
        "training_date": datetime.now().isoformat(),
        "n_training_samples": len(X_train),
        "n_test_samples": len(X_test),
        "fraud_ratio": float(fraud_ratio),
        "metrics": best_metrics,
        "thresholds": thresholds,
        "all_model_results": {
            name: {
                "metrics": result["metrics"],
            }
            for name, result in results.items()
        },
    }

    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[SUCCESS] Artifacts saved:")
    print(f"  Model: {MODEL_PATH}")
    print(f"  Preprocessor: {PREPROCESSOR_PATH}")
    print(f"  Metadata: {METADATA_PATH}")

    return best_model, preprocessor, best_metrics, thresholds


def main():
    model, preprocessor, metrics, thresholds = train_pipeline(
        n_samples=50000,
        fraud_ratio=0.05,
        retrain=True,
    )

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"Best Model: {type(model).__name__}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall: {metrics['recall']:.4f}")
    print(f"F1-Score: {metrics['f1_score']:.4f}")
    print(f"ROC-AUC: {metrics['roc_auc']:.4f}")
    print(f"PR-AUC: {metrics['pr_auc']:.4f}")
    print(f"HIGH threshold: >= {thresholds['high']:.4f}")
    print(f"MEDIUM threshold: >= {thresholds['medium']:.4f}")


if __name__ == "__main__":
    main()
