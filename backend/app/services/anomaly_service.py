import os
import json
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from app.core.config import settings

FEATURE_ORDER = [
    "amount",
    "avg_spending",
    "hour",
    "frequency_score",
    "amount_to_avg_ratio",
]

CONTAMINATION = 0.02


class AnomalyService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.metadata = None
        self.score_history = []
        self.dynamic_thresholds = None
        self.config = None
        self._initialize()

    def _load_config(self):
        import os

        possible_paths = [
            "app/models/model_config.json",
            "backend/app/models/model_config.json",
        ]

        for config_path in possible_paths:
            if os.path.exists(config_path):
                print(f"[AnomalyService] Config loaded from: {config_path}")
                with open(config_path, "r") as f:
                    self.config = json.load(f)
                    print(
                        f"[AnomalyService] Thresholds: {self.config.get('thresholds')}"
                    )
                break

    def _initialize(self):
        model_path = settings.MODEL_PATH
        scaler_path = model_path.replace(".joblib", "_scaler.joblib")
        metadata_path = model_path.replace(".joblib", "_metadata.joblib")

        print(f"\n{'=' * 60}")
        print("[AnomalyService] INITIALIZING")
        print(f"{'=' * 60}")
        print(f"[AnomalyService] Model path: {model_path}")
        print(f"[AnomalyService] Scaler path: {scaler_path}")

        self._load_config()

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            print(f"[AnomalyService] Loading existing model and scaler...")
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            if os.path.exists(metadata_path):
                self.metadata = joblib.load(metadata_path)
                print(
                    f"[AnomalyService] Metadata loaded: {self.metadata.get('dataset_name', 'Unknown')}"
                )
                print(
                    f"[AnomalyService] Training date: {self.metadata.get('training_date', 'Unknown')}"
                )
                if "metrics" in self.metadata:
                    m = self.metadata["metrics"]
                    print(
                        f"[AnomalyService] Model metrics - Accuracy: {m.get('accuracy', 0):.4f}, Precision: {m.get('precision', 0):.4f}"
                    )
            print(f"[AnomalyService] Model and scaler loaded successfully!")
        else:
            print(
                f"[AnomalyService] Model files not found! Running training pipeline..."
            )
            self._train_and_save(model_path, scaler_path, metadata_path)

    def _train_and_save(self, model_path: str, scaler_path: str, metadata_path: str):
        from app.services.train_model import (
            generate_realistic_dataset,
            prepare_features,
            train_model,
            evaluate_model,
            FEATURE_COLUMNS,
            CONTAMINATION,
        )
        import pandas as pd

        print(f"\n[AnomalyService] Training new model with {FEATURE_COLUMNS}")

        df = generate_realistic_dataset(n_samples=100000, fraud_ratio=0.02)
        df_prep = prepare_features(df)

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(df_prep[FEATURE_COLUMNS])

        self.model = IsolationForest(
            n_estimators=200,
            contamination=CONTAMINATION,
            max_samples=0.8,
            random_state=42,
            n_jobs=-1,
        )
        self.model.fit(X_scaled)

        self.metadata = evaluate_model(self.model, self.scaler, df)

        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(self.model, model_path)
        joblib.dump(self.scaler, scaler_path)
        joblib.dump(self.metadata, metadata_path)

        config = {
            "features": FEATURE_COLUMNS,
            "contamination": CONTAMINATION,
            "n_estimators": 200,
            "thresholds": self.metadata.get("thresholds", {}),
        }
        config_path = model_path.replace(".joblib", "_config.json")
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)

        print(f"[AnomalyService] Model trained and saved")

    def _extract_features(self, input_data: dict) -> np.ndarray:
        print(f"\n{'=' * 60}")
        print("[AnomalyService] FEATURE EXTRACTION")
        print(f"{'=' * 60}")
        print(f"[AnomalyService] Input data: {input_data}")

        amount = float(input_data.get("amount", 0))
        avg_spending = float(input_data.get("avg_spending", 50))

        amount_to_avg_ratio = amount / (avg_spending + 1) if avg_spending > 0 else 1.0

        try:
            hour = int(input_data.get("time", "12:00").split(":")[0])
        except (ValueError, IndexError):
            hour = 12

        frequency_score = float(input_data.get("frequency_score", 0.5))

        features = np.array(
            [
                amount,
                avg_spending,
                hour,
                frequency_score,
                amount_to_avg_ratio,
            ]
        )

        print(f"[AnomalyService] Raw features extracted:")
        for i, name in enumerate(FEATURE_ORDER):
            print(f"  - {name}: {features[i]}")

        print(f"[AnomalyService] Feature order: {FEATURE_ORDER}")

        return features.reshape(1, -1)

    def _calculate_anomaly_score(self, raw_score: float) -> float:
        normalized = (raw_score + 1) / 2
        normalized = max(0.0, min(1.0, normalized))
        return round(float(normalized), 3)

    def _calibrate_thresholds(self):
        if self.config and "thresholds" in self.config:
            self.dynamic_thresholds = self.config["thresholds"]
            print(
                f"[AnomalyService] Loaded thresholds from config: {self.dynamic_thresholds}"
            )
            return

        if self.metadata is not None and "thresholds" in self.metadata:
            self.dynamic_thresholds = self.metadata["thresholds"]
            print(
                f"[AnomalyService] Loaded thresholds from metadata: {self.dynamic_thresholds}"
            )
            return

        import pandas as pd
        from app.services.train_model import (
            generate_realistic_dataset,
            prepare_features,
            FEATURE_COLUMNS,
        )

        df = generate_realistic_dataset(n_samples=5000, fraud_ratio=0.02)
        df_prep = prepare_features(df)
        X_scaled = self.scaler.transform(df_prep[FEATURE_COLUMNS])

        raw_scores = self.model.score_samples(X_scaled)
        normalized_scores = (raw_scores + 1) / 2

        normal_mask = df_prep["is_fraud"] == 0
        normal_scores = normalized_scores[normal_mask]

        self.dynamic_thresholds = {
            "HIGH": float(np.percentile(normal_scores, 10)),
            "MEDIUM": float(np.percentile(normal_scores, 30)),
        }
        print(f"[AnomalyService] Computed thresholds: {self.dynamic_thresholds}")

    def _determine_risk_level(self, score: float) -> str:
        if self.dynamic_thresholds is None:
            self._calibrate_thresholds()

        if score <= self.dynamic_thresholds["HIGH"]:
            return "HIGH"
        elif score <= self.dynamic_thresholds["MEDIUM"]:
            return "MEDIUM"
        else:
            return "LOW"

    def analyze_transaction(self, input_data: dict) -> dict:
        features = self._extract_features(input_data)

        if self.scaler is None or self.model is None:
            raise RuntimeError("Model or scaler not initialized")

        features_scaled = self.scaler.transform(features)
        print(f"[AnomalyService] Scaled features: {features_scaled}")

        raw_score = self.model.score_samples(features_scaled)[0]
        print(f"[AnomalyService] Raw anomaly score (Isolation Forest): {raw_score}")

        anomaly_score = self._calculate_anomaly_score(raw_score)
        print(
            f"[AnomalyService] Normalized score (0-1, higher=more normal): {anomaly_score}"
        )

        self.score_history.append(anomaly_score)

        risk_level = self._determine_risk_level(anomaly_score)
        print(f"[AnomalyService] Risk level: {risk_level}")
        print(f"[AnomalyService] Thresholds used: {self.dynamic_thresholds}")

        return {"anomaly_score": anomaly_score, "risk_level": risk_level}


anomaly_service = AnomalyService()
