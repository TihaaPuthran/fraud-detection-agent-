---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Backend Setup & ML Model Foundation

## Objective
Set up the backend development environment and implement an offline training script for the initial fraud detection model.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- @agents.md

## Tasks

<task type="auto">
  <name>Scaffold Backend Environment</name>
  <files>
    - requirements.txt
    - .env.example
    - main.py
  </files>
  <action>
    - Create a requirements.txt file with: fastapi, uvicorn, scikit-learn, joblib, pandas, pydantic, supabase-py.
    - Set up a .env.example with placeholders for SUPABASE_URL and SUPABASE_KEY.
    - Create a minimal main.py to verify FastAPI is running.
  </action>
  <verify>python -m uvicorn main:app --port 8000 --help</verify>
  <done>FastAPI environment is ready and dependencies are defined.</done>
</task>

<task type="auto">
  <name>Implement Model Training Script</name>
  <files>
    - scripts/train_model.py
    - models/.gitkeep
  </files>
  <action>
    - Build a script to train an Isolation Forest model using a public dataset (e.g., Credit Card Fraud Detection dataset or a representative subset).
    - Features: amount, user_id (encoded), transaction_time, is_foreign.
    - Serialize the model to models/fraud_model.joblib using joblib.
  </action>
  <verify>python scripts/train_model.py</verify>
  <done>models/fraud_model.joblib exists and was created successfully.</done>
</task>

<task type="auto">
  <name>Basic Inference Logic</name>
  <files>
    - backend/ml_engine.py
  </files>
  <action>
    - Implement a FraudEngine class that loads the joblib model.
    - Add a predict() method that takes a transaction dictionary and returns an anomaly score and risk level (LOW, MEDIUM, HIGH).
  </action>
  <verify>python -c "from backend.ml_engine import FraudEngine; print('Engine Loaded')"</verify>
  <done>Inference logic is ready for integration.</done>
</task>

## Success Criteria
- [ ] Requirements.txt includes all necessary libraries.
- [ ] Isolation Forest model is successfully trained and serialized.
- [ ] FraudEngine can load the model and perform dummy predictions.
