# DECISIONS.md — Architecture & Implementation Decisions

## Phase 1 Decisions
**Date:** 2026-03-23

### Scope
- **Model Training:** Implement a standalone script `train_model.py` that processes a fixed dataset and outputs a serialized model file.
- **FastAPI Core:** Build a minimal server with lifespan events to load the model on startup.
- **Dataset:** Use a standard public dataset (e.g., Credit Card Fraud Detection) for building the initial Isolation Forest model.

### Approach
- **Chose:** Option B — Fixed Dataset (Public Source).
- **Reason:** Provides a realistic baseline of fraud patterns for the Reasoning Agent to explain later without the overhead of building a synthetic generator from scratch.
- **Serialization:** Chose `joblib` over `pickle` for better performance with Scikit-learn models.

### Constraints
- All ML logic must happen on the CPU to ensure easy deployment on Render's free/standard tiers.
- Endpoint responses must conform to the schema defined in `agents.md`.
