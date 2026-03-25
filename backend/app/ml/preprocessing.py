import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import List


class FraudPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_names: List[str] = []
        self.is_fitted = False

    def fit(self, X: pd.DataFrame):
        self.feature_names = list(X.columns)
        self.scaler.fit(X.values)
        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before transform")
        return self.scaler.transform(X.values)

    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        self.fit(X)
        return self.transform(X)

    def inverse_transform(self, X_scaled: np.ndarray) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before inverse_transform")
        return self.scaler.inverse_transform(X_scaled)

    def get_feature_names(self) -> List[str]:
        return self.feature_names.copy()

    def get_params(self) -> dict:
        return {
            "feature_names": self.feature_names,
            "is_fitted": self.is_fitted,
            "n_features": len(self.feature_names),
        }
