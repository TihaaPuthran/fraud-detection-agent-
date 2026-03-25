import os
import json
import numpy as np
import joblib
import pandas as pd
from typing import Dict, Any, Optional

from ..ml.feature_builder import build_features, FEATURE_NAMES
from ..ml.preprocessing import FraudPreprocessor
from ..ml.evaluation import determine_risk_level

MODEL_DIR = "backend/app/models"
MODEL_PATH = os.path.join(MODEL_DIR, "fraud_model.joblib")
PREPROCESSOR_PATH = os.path.join(MODEL_DIR, "fraud_preprocessor.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "fraud_metadata.json")

DEFAULT_HIGH_THRESHOLD = 0.55
DEFAULT_MEDIUM_THRESHOLD = 0.40


class FraudPredictionService:
    def __init__(self):
        self.model: Optional[Any] = None
        self.preprocessor: Optional[FraudPreprocessor] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.thresholds: Dict[str, float] = {
            "high": DEFAULT_HIGH_THRESHOLD,
            "medium": DEFAULT_MEDIUM_THRESHOLD,
        }
        self.model_name: str = "Unknown"
        self.model_version: str = "1.0.0"
        self._initialize()

    def _load_metadata(self):
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)
            print(
                f"[FraudPrediction] Metadata loaded: {self.metadata.get('model_name', 'Unknown')}"
            )
            print(
                f"[FraudPrediction] Training date: {self.metadata.get('training_date', 'Unknown')}"
            )
            self.model_name = self.metadata.get("model_name", "Unknown")

            metrics = self.metadata.get("metrics", {})
            print(
                f"[FraudPrediction] Model metrics - Precision: {metrics.get('precision', 0):.4f}, Recall: {metrics.get('recall', 0):.4f}"
            )

            saved_thresholds = self.metadata.get("thresholds", {})
            if saved_thresholds:
                self.thresholds.update(saved_thresholds)
                print(
                    f"[FraudPrediction] Thresholds loaded: HIGH >= {self.thresholds['high']:.4f}, MEDIUM >= {self.thresholds['medium']:.4f}"
                )

    def _initialize(self):
        print(f"\n{'=' * 60}")
        print("[FraudPrediction] INITIALIZING")
        print(f"{'=' * 60}")
        print(f"[FraudPrediction] Model path: {MODEL_PATH}")
        print(f"[FraudPrediction] Preprocessor path: {PREPROCESSOR_PATH}")

        self._load_metadata()

        if os.path.exists(MODEL_PATH) and os.path.exists(PREPROCESSOR_PATH):
            print(f"[FraudPrediction] Loading existing model and preprocessor...")
            self.model = joblib.load(MODEL_PATH)
            self.preprocessor = joblib.load(PREPROCESSOR_PATH)
            print(f"[FraudPrediction] Model and preprocessor loaded successfully!")
        else:
            print(f"[FraudPrediction] Model files not found. Training new model...")
            self._train_and_save()

    def _train_and_save(self):
        from app.services.model_trainer import train_pipeline

        self.model, self.preprocessor, metrics, self.thresholds = train_pipeline(
            n_samples=100000,
            fraud_ratio=0.02,
            retrain=True,
        )

        self._load_metadata()

        print(f"[FraudPrediction] New model trained and loaded")

    def _build_features(self, input_data: Dict[str, Any]) -> pd.DataFrame:
        features_dict = build_features(input_data)

        df = pd.DataFrame([features_dict], columns=FEATURE_NAMES)

        return df

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        print(f"\n{'=' * 60}")
        print("[FraudPrediction] PREDICTION")
        print(f"{'=' * 60}")
        print(f"[FraudPrediction] Input: {input_data}")

        if self.model is None or self.preprocessor is None:
            raise RuntimeError("Model or preprocessor not initialized")

        features_df = self._build_features(input_data)

        print(f"[FraudPrediction] Features extracted: {features_df.iloc[0].to_dict()}")

        features_scaled = self.preprocessor.transform(features_df)

        fraud_probability = float(self.model.predict_proba(features_scaled)[0, 1])

        print(f"[FraudPrediction] Fraud probability: {fraud_probability:.4f}")

        risk_level = determine_risk_level(
            fraud_probability, self.thresholds["high"], self.thresholds["medium"]
        )

        print(f"[FraudPrediction] Risk level: {risk_level}")

        model_confidence = self._calculate_confidence(fraud_probability)

        return {
            "fraud_probability": round(fraud_probability, 4),
            "risk_level": risk_level,
            "model_confidence": round(model_confidence, 4),
            "model_name": self.model_name,
            "model_version": self.model_version,
            "thresholds": {
                "high": self.thresholds["high"],
                "medium": self.thresholds["medium"],
            },
        }

    def _calculate_confidence(self, probability: float) -> float:
        distance_from_boundary = abs(probability - 0.5)
        confidence = min(1.0, distance_from_boundary * 2)
        return confidence

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "model_type": self.metadata.get("model_type", "Unknown")
            if self.metadata
            else "Unknown",
            "model_version": self.model_version,
            "features": FEATURE_NAMES,
            "n_features": len(FEATURE_NAMES),
            "training_date": self.metadata.get("training_date", "Unknown")
            if self.metadata
            else "Unknown",
            "metrics": self.metadata.get("metrics", {}) if self.metadata else {},
            "thresholds": self.thresholds,
        }


fraud_service = FraudPredictionService()
