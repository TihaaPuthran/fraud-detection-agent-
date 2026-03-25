---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: FastAPI Lifespan & Supabase Integration

## Objective
Connect the ML engine to the FastAPI application and set up Supabase for transaction persistence.

## Context
- .gsd/SPEC.md
- .gsd/DECISIONS.md
- backend/ml_engine.py

## Tasks

<task type="auto">
  <name>Integrate Supabase Client</name>
  <files>
    - backend/supabase_client.py
  </files>
  <action>
    - Implement a Supabase client singleton or helper.
    - Use SUPABASE_URL and SUPABASE_KEY from environment variables.
  </action>
  <verify>python -c "from backend.supabase_client import supabase; print('Supabase client initialized')"</verify>
  <done>Supabase client is ready for use.</done>
</task>

<task type="auto">
  <name>FastAPI Lifespan Implementation</name>
  <files>
    - main.py
  </files>
  <action>
    - Implement the FastAPI lifespan context manager to load the FraudEngine on startup.
    - Register the FraudEngine instance in the app state (app.state.ml_model).
  </action>
  <verify>python -m uvicorn main:app --port 8000</verify>
  <done>Server loads the ML model once on startup.</done>
</task>

<task type="auto">
  <name>Detection Endpoint Core</name>
  <files>
    - main.py
    - backend/schemas.py
  </files>
  <action>
    - Create a Pydantic schema for the transaction input (matching agents.md).
    - Implement a POST /api/v1/detect endpoint that uses app.state.ml_model to get a risk score.
    - Basic implementation: Get score -> Log to console -> Return score. (Agent logic and DB storage come later).
  </action>
  <verify>Invoke-RestMethod -Uri "http://localhost:8000/api/v1/detect" -Method Post -Body (ConvertTo-Json @{amount=100; user_id="user123"; time="2024-01-01"; location="USA"}) -ContentType "application/json"</verify>
  <done>A functional endpoint returns an anomaly score from the loaded model.</done>
</task>

## Success Criteria
- [ ] FastAPI server starts without errors and loads the model.
- [ ] Supabase client initializes correctly.
- [ ] POST /api/v1/detect returns a valid risk score.
