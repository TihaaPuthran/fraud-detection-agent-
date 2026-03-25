import numpy as np
from typing import Dict, Any, List

FEATURE_NAMES: List[str] = [
    "amount",
    "avg_spending",
    "hour",
    "frequency_score",
    "amount_to_avg_ratio",
    "is_high_amount",
    "is_unusual_hour",
    "amount_log",
    "spending_deviation",
]

FEATURE_ORDER: List[str] = FEATURE_NAMES


def build_features(input_data: Dict[str, Any]) -> np.ndarray:
    amount = float(input_data.get("amount", 0))
    avg_spending = float(input_data.get("avg_spending", 50))

    hour = _extract_hour(input_data.get("time", "12:00"))

    amount_to_avg_ratio = amount / (avg_spending + 1) if avg_spending > 0 else 1.0

    amount_log = np.log1p(amount)
    frequency_score = 1.0 / (1.0 + amount_log)

    is_high_amount = 1.0 if amount > avg_spending * 3 else 0.0
    is_unusual_hour = 1.0 if hour < 6 or hour > 22 else 0.0

    spending_deviation = (
        (amount - avg_spending) / (avg_spending + 1) if avg_spending > 0 else 0.0
    )

    features = np.array(
        [
            amount,
            avg_spending,
            hour,
            frequency_score,
            amount_to_avg_ratio,
            is_high_amount,
            is_unusual_hour,
            amount_log,
            spending_deviation,
        ]
    )

    return features


def build_features_from_dict(input_data: Dict[str, Any]) -> Dict[str, float]:
    amount = float(input_data.get("amount", 0))
    avg_spending = float(input_data.get("avg_spending", 50))

    hour = _extract_hour(input_data.get("time", "12:00"))

    amount_to_avg_ratio = amount / (avg_spending + 1) if avg_spending > 0 else 1.0

    amount_log = np.log1p(amount)
    frequency_score = 1.0 / (1.0 + amount_log)

    is_high_amount = 1.0 if amount > avg_spending * 3 else 0.0
    is_unusual_hour = 1.0 if hour < 6 or hour > 22 else 0.0

    spending_deviation = (
        (amount - avg_spending) / (avg_spending + 1) if avg_spending > 0 else 0.0
    )

    return {
        "amount": amount,
        "avg_spending": avg_spending,
        "hour": hour,
        "frequency_score": frequency_score,
        "amount_to_avg_ratio": amount_to_avg_ratio,
        "is_high_amount": is_high_amount,
        "is_unusual_hour": is_unusual_hour,
        "amount_log": amount_log,
        "spending_deviation": spending_deviation,
    }


def _extract_hour(time_str: str) -> int:
    try:
        if isinstance(time_str, str):
            if ":" in time_str:
                return int(time_str.split(":")[0])
            else:
                return int(time_str)
        return int(time_str)
    except (ValueError, IndexError):
        return 12


def get_feature_names() -> List[str]:
    return FEATURE_NAMES.copy()


def get_num_features() -> int:
    return len(FEATURE_NAMES)
