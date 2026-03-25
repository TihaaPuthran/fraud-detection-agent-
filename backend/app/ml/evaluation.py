import numpy as np
import pandas as pd
from typing import Dict, Tuple, Any
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    precision_recall_curve,
    roc_auc_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
)


def evaluate_model(
    y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray
) -> Dict[str, Any]:
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    try:
        roc_auc = roc_auc_score(y_true, y_prob)
    except ValueError:
        roc_auc = 0.0

    try:
        pr_auc = average_precision_score(y_true, y_prob)
    except ValueError:
        pr_auc = 0.0

    cm = confusion_matrix(y_true, y_pred)
    if cm.shape == (2, 2):
        tn, fp, fn, tp = cm.ravel()
    else:
        tn, fp, fn, tp = 0, 0, 0, 0

    report = classification_report(
        y_true, y_pred, target_names=["Normal", "Fraud"], output_dict=True
    )

    return {
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc),
        "pr_auc": float(pr_auc),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
        "classification_report": report,
    }


def find_optimal_threshold(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    target_recall: float = 0.85,
    min_precision: float = 0.3,
) -> Tuple[float, float, float]:
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_prob)

    f1_scores = 2 * (precisions * recalls) / (precisions + recalls + 1e-10)
    best_f1_idx = np.argmax(f1_scores[:-1])
    best_f1_threshold = thresholds[best_f1_idx]
    best_f1 = f1_scores[best_f1_idx]

    high_risk_threshold = None
    for i, rec in enumerate(recalls):
        if rec >= 0.90 and precisions[i] >= min_precision:
            high_risk_threshold = thresholds[i]
            break

    if high_risk_threshold is None:
        high_risk_threshold = best_f1_threshold

    medium_risk_threshold = None
    for i, rec in enumerate(recalls):
        if rec >= 0.70 and precisions[i] >= min_precision * 0.7:
            medium_risk_threshold = thresholds[i]
            break

    if medium_risk_threshold is None:
        medium_risk_threshold = best_f1_threshold * 0.7

    fraud_mask = y_true == 1
    normal_mask = y_true == 0

    fraud_probs = y_prob[fraud_mask]
    normal_probs = y_prob[normal_mask]

    if len(fraud_probs) > 0 and len(normal_probs) > 0:
        fraud_median = np.median(fraud_probs)
        normal_90th = np.percentile(normal_probs, 90)

        balanced_high = (fraud_median + normal_90th) / 2
        balanced_medium = normal_90th * 0.8

        if balanced_high > 0.3:
            high_risk_threshold = balanced_high
        if balanced_medium > 0.15:
            medium_risk_threshold = balanced_medium

    high_risk_threshold = max(0.5, high_risk_threshold)
    medium_risk_threshold = max(0.3, medium_risk_threshold)

    return (
        float(high_risk_threshold),
        float(medium_risk_threshold),
        float(best_f1_threshold),
    )


def determine_risk_level(
    fraud_probability: float, high_threshold: float, medium_threshold: float
) -> str:
    if fraud_probability >= high_threshold:
        return "HIGH"
    elif fraud_probability >= medium_threshold:
        return "MEDIUM"
    else:
        return "LOW"


def print_evaluation_report(metrics: Dict[str, Any], thresholds: Dict[str, float]):
    print("\n" + "=" * 60)
    print("MODEL EVALUATION REPORT")
    print("=" * 60)

    print("\n[Classification Metrics]")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1-Score:  {metrics['f1_score']:.4f}")
    print(f"  ROC-AUC:   {metrics['roc_auc']:.4f}")
    print(f"  PR-AUC:    {metrics['pr_auc']:.4f}")

    print("\n[Confusion Matrix]")
    cm = metrics["confusion_matrix"]
    print(f"  True Negatives:  {cm['tn']:,}")
    print(f"  False Positives: {cm['fp']:,}")
    print(f"  False Negatives: {cm['fn']:,}")
    print(f"  True Positives:  {cm['tp']:,}")

    print("\n[Risk Thresholds]")
    print(f"  HIGH threshold:   >= {thresholds['high']:.4f}")
    print(f"  MEDIUM threshold: >= {thresholds['medium']:.4f}")
    print(f"  Default threshold: {thresholds['default']:.4f}")

    print("\n[Classification Report]")
    report = metrics["classification_report"]
    for label in ["Normal", "Fraud", "weighted avg"]:
        if label in report:
            r = report[label]
            print(
                f"  {label:15s} - Precision: {r['precision']:.4f}, Recall: {r['recall']:.4f}, F1: {r['f1-score']:.4f}, Support: {r['support']}"
            )

    print("\n" + "=" * 60)


def calculate_expected_cost(
    cm: Dict[str, int], fp_cost: float = 10.0, fn_cost: float = 500.0
) -> float:
    total_cost = cm["fp"] * fp_cost + cm["fn"] * fn_cost
    return total_cost
