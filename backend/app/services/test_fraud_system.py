import sys
import os

sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)


def test_normal_transaction():
    print("\n" + "=" * 60)
    print("TEST 1: NORMAL TRANSACTION (Expected: LOW risk)")
    print("=" * 60)

    from backend.app.services.fraud_prediction_service import fraud_service

    input_data = {
        "amount": 200.0,
        "avg_spending": 150.0,
        "time": "14:00",
        "location": "New York",
        "user_id": "test_user_1",
    }

    print(f"Input: {input_data}")

    result = fraud_service.predict(input_data)

    print(f"\nResult:")
    print(f"  Fraud Probability: {result['fraud_probability']:.4f}")
    print(f"  Risk Level: {result['risk_level']}")
    print(f"  Model Confidence: {result['model_confidence']:.4f}")

    assert result["risk_level"] == "LOW", f"Expected LOW, got {result['risk_level']}"
    assert result["fraud_probability"] < 0.5, (
        f"Expected probability < 0.5, got {result['fraud_probability']}"
    )

    print("\n[PASS] Test 1 passed: Normal transaction correctly identified as LOW risk")
    return True


def test_suspicious_transaction():
    print("\n" + "=" * 60)
    print("TEST 2: SUSPICIOUS TRANSACTION (Expected: HIGH risk)")
    print("=" * 60)

    from backend.app.services.fraud_prediction_service import fraud_service

    input_data = {
        "amount": 5000.0,
        "avg_spending": 100.0,
        "time": "03:00",
        "location": "Unknown",
        "user_id": "test_user_2",
    }

    print(f"Input: {input_data}")

    result = fraud_service.predict(input_data)

    print(f"\nResult:")
    print(f"  Fraud Probability: {result['fraud_probability']:.4f}")
    print(f"  Risk Level: {result['risk_level']}")
    print(f"  Model Confidence: {result['model_confidence']:.4f}")

    assert result["risk_level"] in ["HIGH", "MEDIUM"], (
        f"Expected HIGH or MEDIUM, got {result['risk_level']}"
    )
    assert result["fraud_probability"] > 0.3, (
        f"Expected probability > 0.3, got {result['fraud_probability']}"
    )

    print("\n[PASS] Test 2 passed: Suspicious transaction correctly flagged")
    return True


def test_borderline_transaction():
    print("\n" + "=" * 60)
    print("TEST 3: BORDERLINE TRANSACTION")
    print("=" * 60)

    from backend.app.services.fraud_prediction_service import fraud_service

    input_data = {
        "amount": 800.0,
        "avg_spending": 500.0,
        "time": "23:30",
        "location": "Chicago",
        "user_id": "test_user_3",
    }

    print(f"Input: {input_data}")

    result = fraud_service.predict(input_data)

    print(f"\nResult:")
    print(f"  Fraud Probability: {result['fraud_probability']:.4f}")
    print(f"  Risk Level: {result['risk_level']}")
    print(f"  Model Confidence: {result['model_confidence']:.4f}")

    print(f"\n[INFO] Borderline transaction received {result['risk_level']} risk level")
    print("[INFO] This is within expected behavior for moderate anomalies")
    return True


def test_feature_consistency():
    print("\n" + "=" * 60)
    print("TEST 4: FEATURE CONSISTENCY")
    print("=" * 60)

    from backend.app.ml.feature_builder import build_features, FEATURE_NAMES
    from backend.app.ml.data_generator import generate_structured_dataset

    df = generate_structured_dataset(n_samples=100, fraud_ratio=0.02)

    print(f"Generated dataset columns: {list(df.columns)}")
    print(f"Feature builder expects: {FEATURE_NAMES}")

    test_input = {
        "amount": 500.0,
        "avg_spending": 400.0,
        "time": "12:00",
    }

    features = build_features(test_input)

    print(f"\nFeatures extracted from input: {features}")
    print(f"Number of features: {len(features)} (expected: {len(FEATURE_NAMES)})")

    assert len(features) == len(FEATURE_NAMES), (
        f"Feature count mismatch: {len(features)} vs {len(FEATURE_NAMES)}"
    )

    for i, (name, value) in enumerate(zip(FEATURE_NAMES, features)):
        print(f"  {name}: {value:.4f}")

    print("\n[PASS] Test 4 passed: Feature consistency verified")
    return True


def test_model_info():
    print("\n" + "=" * 60)
    print("TEST 5: MODEL INFO")
    print("=" * 60)

    from backend.app.services.fraud_prediction_service import fraud_service

    info = fraud_service.get_model_info()

    print(f"\nModel Information:")
    for key, value in info.items():
        if isinstance(value, dict):
            print(f"  {key}:")
            for k, v in value.items():
                if isinstance(v, float):
                    print(f"    {k}: {v:.4f}")
                else:
                    print(f"    {k}: {v}")
        elif isinstance(value, list):
            print(f"  {key}: {value}")
        else:
            print(f"  {key}: {value}")

    assert "model_name" in info, "Model info missing 'model_name'"
    assert "features" in info, "Model info missing 'features'"
    assert "thresholds" in info, "Model info missing 'thresholds'"

    print("\n[PASS] Test 5 passed: Model info retrieved successfully")
    return True


def test_reasoning_service():
    print("\n" + "=" * 60)
    print("TEST 6: REASONING SERVICE (FALLBACK)")
    print("=" * 60)

    from backend.app.services.reasoning_service import reasoning_service

    transaction_data = {
        "amount": 1000.0,
        "avg_spending": 200.0,
        "location": "Unknown",
        "time": "04:00",
    }

    reasoning = reasoning_service.generate_reasoning(
        transaction_data,
        fraud_probability=0.75,
        risk_level="HIGH",
        model_confidence=0.85,
    )

    print(f"\nGenerated Reasoning:")
    print(f"  Explanation: {reasoning['explanation']}")
    print(f"  Recommendation: {reasoning['recommendation']}")
    print(f"  Key Factors: {reasoning['key_factors']}")

    assert "explanation" in reasoning, "Missing explanation"
    assert "recommendation" in reasoning, "Missing recommendation"
    assert "key_factors" in reasoning, "Missing key_factors"
    assert reasoning["recommendation"] == "Block transaction", (
        f"Expected 'Block transaction', got '{reasoning['recommendation']}'"
    )

    print("\n[PASS] Test 6 passed: Reasoning service works correctly")
    return True


def run_all_tests():
    print("\n" + "=" * 60)
    print("RUNNING FRAUD DETECTION SYSTEM TESTS")
    print("=" * 60)

    tests = [
        ("Feature Consistency", test_feature_consistency),
        ("Model Info", test_model_info),
        ("Normal Transaction", test_normal_transaction),
        ("Suspicious Transaction", test_suspicious_transaction),
        ("Borderline Transaction", test_borderline_transaction),
        ("Reasoning Service", test_reasoning_service),
    ]

    results = []

    for name, test_func in tests:
        try:
            passed = test_func()
            results.append((name, "PASS" if passed else "FAIL", None))
        except Exception as e:
            print(f"\n[ERROR] {name} failed with exception: {e}")
            results.append((name, "ERROR", str(e)))

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    for name, status, error in results:
        status_symbol = (
            "[PASS]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[ERR]"
        )
        print(f"  {status_symbol} {name}: {status}")
        if error:
            print(f"    Error: {error}")

    passed = sum(1 for _, s, _ in results if s == "PASS")
    total = len(results)

    print(f"\nTotal: {passed}/{total} tests passed")

    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
