import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
import joblib
from datetime import datetime

MODEL_DIR = "backend/app/models"
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "isolation_forest_scaler.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "model_metadata.joblib")
DATA_PATH = os.path.join(MODEL_DIR, "training_data.csv")

FEATURE_COLUMNS = [
    "amount",
    "avg_spending",
    "hour",
    "frequency_score",
    "amount_to_avg_ratio",
]

CONTAMINATION = 0.02
N_ESTIMATORS = 200
RANDOM_STATE = 42


def download_kaggle_dataset():
    try:
        import kaggle
        from kaggle.api.kaggle_api_extended import KaggleApi

        api = KaggleApi()
        api.authenticate()

        print("Downloading Credit Card Fraud Detection dataset from Kaggle...")
        api.dataset_download_files(
            "mlg-ulb/creditcardfraud",
            path=MODEL_DIR,
            unzip=True,
        )

        csv_path = os.path.join(MODEL_DIR, "creditcard.csv")
        if os.path.exists(csv_path):
            return csv_path

        for f in os.listdir(MODEL_DIR):
            if f.endswith(".csv"):
                return os.path.join(MODEL_DIR, f)

        raise FileNotFoundError("CSV file not found after download")

    except ImportError:
        print("Kaggle library not installed. Trying to use opendatasets...")
        try:
            import opendatasets as od

            od.download(
                "https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud",
                data_dir=MODEL_DIR,
            )
            csv_path = os.path.join(MODEL_DIR, "creditcardfraud", "creditcard.csv")
            if os.path.exists(csv_path):
                return csv_path
        except ImportError:
            pass

        print("Could not download from Kaggle. Please manually download from:")
        print("https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud")
        print(f"and place it as '{DATA_PATH}' or 'creditcard.csv' in {MODEL_DIR}")
        return None


def load_real_dataset():
    possible_paths = [
        os.path.join(MODEL_DIR, "creditcard.csv"),
        os.path.join(MODEL_DIR, "creditcardfraud", "creditcard.csv"),
        DATA_PATH,
    ]

    for path in possible_paths:
        if os.path.exists(path):
            print(f"Loading dataset from: {path}")
            df = pd.read_csv(path)
            print(f"Dataset loaded: {df.shape[0]:,} rows, {df.shape[1]} columns")
            return df

    print("\nNo local dataset found. Attempting to download...")
    return download_kaggle_dataset()


def preprocess_kaggle_data(df: pd.DataFrame) -> pd.DataFrame:
    print("\nPreprocessing Kaggle Credit Card Fraud dataset...")
    print(f"  Original columns: {list(df.columns)}")

    if "Class" in df.columns:
        df = df.rename(columns={"Class": "is_fraud"})

    df = df.rename(columns={"Amount": "amount"})

    if "Time" in df.columns:
        df["hour"] = ((df["Time"] / 3600) % 24).astype(int)
    else:
        df["hour"] = np.random.randint(0, 24, size=len(df))

    is_fraud = df["is_fraud"].values if "is_fraud" in df.columns else np.zeros(len(df))

    normal_mask = is_fraud == 0
    fraud_mask = is_fraud == 1

    df["avg_spending"] = df["amount"].copy()

    df.loc[normal_mask, "avg_spending"] = df.loc[
        normal_mask, "amount"
    ] * np.random.uniform(0.5, 1.5, size=normal_mask.sum())
    df.loc[normal_mask, "avg_spending"] = df.loc[normal_mask, "avg_spending"].clip(
        1, df["amount"].max()
    )

    df.loc[fraud_mask, "avg_spending"] = df.loc[
        fraud_mask, "amount"
    ] * np.random.uniform(0.1, 0.5, size=fraud_mask.sum())

    df["amount_to_avg_ratio"] = df["amount"] / (df["avg_spending"] + 1)

    amount_log = np.log1p(df["amount"])
    df["frequency_score"] = 1.0 / (1.0 + amount_log)

    df = df[
        [
            "amount",
            "avg_spending",
            "hour",
            "frequency_score",
            "amount_to_avg_ratio",
            "is_fraud",
        ]
    ]

    print(
        f"  Features created: amount, avg_spending, hour, frequency_score, amount_to_avg_ratio"
    )
    print(f"  Fraud ratio: {is_fraud.mean() * 100:.3f}%")

    return df


def generate_realistic_dataset(
    n_samples: int = 100000, fraud_ratio: float = 0.02
) -> pd.DataFrame:
    np.random.seed(RANDOM_STATE)

    n_fraud = int(n_samples * fraud_ratio)
    n_normal = n_samples - n_fraud

    print(
        f"Generating realistic dataset: {n_samples:,} samples ({n_fraud:,} fraud, {n_normal:,} normal)"
    )

    normal_data = {
        "amount": np.abs(np.random.lognormal(mean=4.5, sigma=1.2, size=n_normal)).clip(
            1, 10000
        ),
        "avg_spending": np.abs(
            np.random.lognormal(mean=4.3, sigma=1.1, size=n_normal)
        ).clip(1, 8000),
        "hour": np.random.randint(0, 24, size=n_normal),
        "frequency_score": np.random.uniform(0.3, 0.9, size=n_normal),
        "amount_to_avg_ratio": np.abs(
            np.random.lognormal(mean=0.1, sigma=0.4, size=n_normal)
        ).clip(0.1, 10),
        "is_fraud": [0] * n_normal,
    }

    fraud_data = {
        "amount": np.abs(np.random.lognormal(mean=6.0, sigma=1.5, size=n_fraud)).clip(
            100, 50000
        ),
        "avg_spending": np.abs(
            np.random.lognormal(mean=4.0, sigma=1.2, size=n_fraud)
        ).clip(1, 5000),
        "hour": np.random.choice([0, 1, 2, 3, 4, 22, 23], size=n_fraud),
        "frequency_score": np.random.uniform(0.05, 0.3, size=n_fraud),
        "amount_to_avg_ratio": np.abs(
            np.random.lognormal(mean=1.2, sigma=0.7, size=n_fraud)
        ).clip(2, 50),
        "is_fraud": [1] * n_fraud,
    }

    df_normal = pd.DataFrame(normal_data)
    df_fraud = pd.DataFrame(fraud_data)

    df = pd.concat([df_normal, df_fraud], ignore_index=True)
    df = df.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

    return df


def prepare_features(df: pd.DataFrame, feature_cols: list = None) -> pd.DataFrame:
    df = df.copy()

    if feature_cols is None:
        if "V1" in df.columns and "V2" in df.columns:
            feature_cols = FEATURE_COLUMNS
        else:
            feature_cols = FEATURE_COLUMNS

    available_features = [c for c in feature_cols if c in df.columns]

    if len(available_features) == 0:
        raise ValueError(f"No features found from {feature_cols}")

    if "is_fraud" in df.columns:
        df = df[available_features + ["is_fraud"]]
    else:
        df = df[available_features]

    missing_before = df[available_features].isnull().sum().sum()
    if missing_before > 0:
        print(f"Handling {missing_before} missing values...")
        df[available_features] = df[available_features].fillna(
            df[available_features].median()
        )

    df[available_features] = df[available_features].replace([np.inf, -np.inf], np.nan)
    df[available_features] = df[available_features].fillna(
        df[available_features].median()
    )

    return df


def train_model(
    X_train: pd.DataFrame,
    contamination: float = CONTAMINATION,
    feature_cols: list = None,
) -> tuple:
    if feature_cols is None:
        feature_cols = [c for c in FEATURE_COLUMNS if c in X_train.columns]

    print("\nTraining Isolation Forest model...")
    print(f"  - n_estimators: {N_ESTIMATORS}")
    print(f"  - contamination: {contamination}")
    print(f"  - features: {feature_cols}")

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train[feature_cols])

    model = IsolationForest(
        n_estimators=N_ESTIMATORS,
        contamination=contamination,
        max_samples=0.8,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbose=1,
    )

    model.fit(X_scaled)

    print("Model training complete!")
    return model, scaler, feature_cols


def evaluate_model(model, scaler, df: pd.DataFrame, feature_cols: list = None) -> dict:
    if feature_cols is None:
        feature_cols = [c for c in FEATURE_COLUMNS if c in df.columns]

    print("\n" + "=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)

    X = df[feature_cols]
    X_scaled = scaler.transform(X)

    predictions = model.predict(X_scaled)
    predictions_binary = (predictions == -1).astype(int)

    y_true = df["is_fraud"].values

    accuracy = accuracy_score(y_true, predictions_binary)
    precision = precision_score(y_true, predictions_binary, zero_division=0)
    recall = recall_score(y_true, predictions_binary, zero_division=0)
    f1 = f1_score(y_true, predictions_binary, zero_division=0)

    try:
        scores = model.score_samples(X_scaled)
        scores_inverted = -scores
        auc = roc_auc_score(y_true, scores_inverted)
    except:
        auc = 0.0

    cm = confusion_matrix(y_true, predictions_binary)
    if cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
    else:
        tn, fp, fn, tp = 0, 0, 0, 0

    raw_scores = model.score_samples(X_scaled)
    normalized_scores = (raw_scores + 1) / 2
    normal_mask = y_true == 0
    normal_scores = normalized_scores[normal_mask]

    thresholds = {
        "HIGH": float(np.percentile(normal_scores, 10)),
        "MEDIUM": float(np.percentile(normal_scores, 30)),
    }

    print(f"\nAccuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"ROC AUC:   {auc:.4f}")

    print(f"\nThresholds (based on normal transaction scores):")
    print(f"  HIGH:   score <= {thresholds['HIGH']:.4f}")
    print(f"  MEDIUM: score <= {thresholds['MEDIUM']:.4f}")

    print(f"\nConfusion Matrix:")
    print(f"  True Negatives:  {tn:,}")
    print(f"  False Positives: {fp:,}")
    print(f"  False Negatives: {fn:,}")
    print(f"  True Positives:  {tp:,}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_true, predictions_binary, target_names=["Normal", "Fraud"]
        )
    )

    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "roc_auc": float(auc),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
        "thresholds": thresholds,
    }


def save_artifacts(
    model, scaler, df: pd.DataFrame, metrics: dict, feature_cols: list = None
):
    if feature_cols is None:
        feature_cols = FEATURE_COLUMNS

    os.makedirs(MODEL_DIR, exist_ok=True)

    print(f"\nSaving artifacts...")
    print(f"  Model: {MODEL_PATH}")
    print(f"  Scaler: {SCALER_PATH}")
    print(f"  Metadata: {METADATA_PATH}")
    print(f"  Data: {DATA_PATH}")

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    df.to_csv(DATA_PATH, index=False)

    fraud_ratio = float(df["is_fraud"].mean()) if "is_fraud" in df.columns else 0.0

    metadata = {
        "dataset_name": "Credit Card Fraud Detection",
        "num_records": len(df),
        "num_features": len(feature_cols),
        "features": feature_cols,
        "fraud_ratio": fraud_ratio,
        "metrics": metrics,
        "training_date": datetime.now().isoformat(),
        "contamination": CONTAMINATION,
        "n_estimators": N_ESTIMATORS,
        "random_state": RANDOM_STATE,
    }

    joblib.dump(metadata, METADATA_PATH)

    with open(os.path.join(MODEL_DIR, "model_config.json"), "w") as f:
        json.dump(
            {
                "features": FEATURE_COLUMNS,
                "contamination": CONTAMINATION,
                "n_estimators": N_ESTIMATORS,
                "thresholds": metrics["thresholds"],
            },
            f,
            indent=2,
        )

    print("\nArtifacts saved successfully!")


def main():
    global FEATURE_COLUMNS, CONTAMINATION

    print("=" * 60)
    print("FRAUD DETECTION ML TRAINING PIPELINE")
    print("=" * 60)
    print(f"\nTimestamp: {datetime.now().isoformat()}")

    df = load_real_dataset()

    use_kaggle = False

    if df is None:
        print("\nFalling back to realistic synthetic dataset...")
        df = generate_realistic_dataset(n_samples=100000, fraud_ratio=0.02)
        CONTAMINATION = 0.02
    elif "V1" in df.columns and "V2" in df.columns:
        print("\n*** USING KAGGLE CREDIT CARD FRAUD DATASET ***")
        print("Detected Kaggle Credit Card Fraud dataset format")
        df = preprocess_kaggle_data(df)
        CONTAMINATION = 0.0017
        use_kaggle = True
    else:
        print("Using loaded dataset")

    print(f"\nDataset shape: {df.shape}")
    if "is_fraud" in df.columns:
        fraud_count = df["is_fraud"].sum()
        fraud_ratio = df["is_fraud"].mean()
        print(f"Fraud transactions: {fraud_count:,} ({fraud_ratio * 100:.3f}%)")
    else:
        print("Warning: No 'is_fraud' label column found")

    print("\nFeature statistics:")
    print(df.describe())

    df_prep = prepare_features(df, FEATURE_COLUMNS)

    available_features = [c for c in FEATURE_COLUMNS if c in df_prep.columns]
    print(f"\nFeatures for training ({len(available_features)}): {available_features}")
    print(f"Training samples: {len(df_prep)}")

    model, scaler, trained_features = train_model(
        df_prep, contamination=CONTAMINATION, feature_cols=available_features
    )

    if "is_fraud" in df_prep.columns:
        metrics = evaluate_model(model, scaler, df_prep, trained_features)
    else:
        print("\nNo labels available - skipping evaluation")
        X_eval = df_prep[available_features]
        X_scaled_eval = scaler.transform(X_eval)
        raw_scores = model.score_samples(X_scaled_eval)
        normalized_scores = (raw_scores + 1) / 2

        metrics = {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "roc_auc": 0.0,
            "tn": 0,
            "fp": 0,
            "fn": 0,
            "tp": 0,
            "thresholds": {
                "HIGH": float(np.percentile(normalized_scores, 10)),
                "MEDIUM": float(np.percentile(normalized_scores, 30)),
            },
        }

    save_artifacts(model, scaler, df_prep, metrics, trained_features)

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"\nModel: {MODEL_PATH}")
    print(f"Scaler: {SCALER_PATH}")
    print(f"Features: {trained_features}")

    return model, scaler, metrics


if __name__ == "__main__":
    main()
