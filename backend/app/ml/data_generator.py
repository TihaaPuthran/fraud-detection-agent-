import numpy as np
import pandas as pd
from typing import Tuple
from .feature_builder import build_features, FEATURE_NAMES

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)


def generate_realistic_data(
    n_samples: int = 50000, fraud_ratio: float = 0.05
) -> pd.DataFrame:
    """
    Generate realistic transaction data with overlapping patterns.
    Real fraud is NOT easily separable - it mimics normal behavior.
    """
    n_fraud = int(n_samples * fraud_ratio)
    n_normal = n_samples - n_fraud

    normal_data = _generate_normal_transactions(n_normal)
    fraud_data = _generate_fraud_transactions(n_fraud)

    df_normal = pd.DataFrame(normal_data)
    df_fraud = pd.DataFrame(fraud_data)

    df = pd.concat([df_normal, df_fraud], ignore_index=True)
    df = df.sample(frac=1, random_state=RANDOM_STATE).reset_index(drop=True)

    return df


def _generate_normal_transactions(n: int) -> dict:
    """
    Normal transactions have diverse patterns, mostly during business hours.
    Some can be high value, some at unusual times (legitimate night transactions).
    """
    base_amounts = np.abs(np.random.lognormal(mean=4.2, sigma=1.4, size=n))
    amounts = np.clip(base_amounts, 5, 15000)

    avg_spendings = np.abs(np.random.lognormal(mean=4.0, sigma=1.3, size=n))
    avg_spendings = np.clip(avg_spendings, 10, 12000)

    normal_hours_prob = np.random.random(n)
    hours = np.where(
        normal_hours_prob < 0.70,
        np.random.randint(8, 21, size=n),
        np.random.randint(0, 24, size=n),
    )

    is_night = (hours < 6) | (hours > 23)
    amounts[is_night] = amounts[is_night] * np.random.uniform(
        0.5, 1.5, size=is_night.sum()
    )

    return {
        "amount": amounts,
        "avg_spending": avg_spendings,
        "hour": hours,
        "is_fraud": np.zeros(n, dtype=int),
    }


def _generate_fraud_transactions(n: int) -> dict:
    """
    Fraud transactions mix legitimate-looking patterns with subtle red flags.
    Not all fraud is high value or at unusual hours.
    """
    is_high_value = np.random.random(n) < 0.30
    is_unusual_hour = np.random.random(n) < 0.40

    amounts = np.zeros(n)
    avg_spendings = np.zeros(n)
    hours = np.zeros(n, dtype=int)

    for i in range(n):
        user_avg = np.random.lognormal(4.0, 1.3)
        avg_spendings[i] = np.clip(user_avg, 10, 12000)

        if is_high_value[i]:
            amount = np.random.lognormal(5.5, 1.2) * 2
        else:
            amount = np.random.lognormal(4.3, 1.1)

        amount = np.clip(amount, 10, 25000)

        deviation = (amount - avg_spendings[i]) / (avg_spendings[i] + 1)
        if deviation < 2.0 and not is_unusual_hour[i]:
            amount = amount * np.random.uniform(1.5, 3.0)

        amounts[i] = amount

        if is_unusual_hour[i]:
            hours[i] = np.random.choice([0, 1, 2, 3, 4, 5, 22, 23])
        else:
            hours[i] = np.random.randint(9, 20)

    noise = np.random.normal(0, 0.05, n)
    amounts = np.clip(amounts * (1 + noise), 10, 25000)

    return {
        "amount": amounts,
        "avg_spending": avg_spendings,
        "hour": hours,
        "is_fraud": np.ones(n, dtype=int),
    }


def generate_structured_dataset(
    n_samples: int = 50000, fraud_ratio: float = 0.05
) -> pd.DataFrame:
    df = generate_realistic_data(n_samples, fraud_ratio)

    feature_dict = {name: [] for name in FEATURE_NAMES}

    for _, row in df.iterrows():
        input_data = {
            "amount": row["amount"],
            "avg_spending": row["avg_spending"],
            "time": f"{int(row['hour']):02d}:00",
        }
        features = build_features(input_data)
        for i, name in enumerate(FEATURE_NAMES):
            feature_dict[name].append(features[i])

    for name in FEATURE_NAMES:
        df[name] = feature_dict[name]

    return df[FEATURE_NAMES + ["is_fraud"]]


def get_train_test_split(
    df: pd.DataFrame, test_size: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    from sklearn.model_selection import train_test_split

    X = df[FEATURE_NAMES]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=RANDOM_STATE, stratify=y
    )

    return X_train, X_test, y_train, y_test


def calculate_class_weights(y: pd.Series) -> dict:
    n_samples = len(y)
    n_fraud = y.sum()
    n_normal = n_samples - n_fraud

    weight_normal = n_samples / (2 * n_normal) if n_normal > 0 else 1
    weight_fraud = n_samples / (2 * n_fraud) if n_fraud > 0 else 1

    return {0: weight_normal, 1: weight_fraud}
