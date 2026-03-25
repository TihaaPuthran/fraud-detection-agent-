# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
A LangChain-powered multi-agent financial fraud detection system that identifies fraudulent transactions using ML anomalies and generates explainable insights using LLMs, all presented through a premium, animated "Dark Fintech" dashboard UI.

## Goals
1. **Multi-Agent Orchestration:** Implement a specialized chain of agents (Data Analyzer, Anomaly Detector, Reasoning, Alert, Report) using LangChain.
2. **ML Anomaly Detection:** Train and integrate an Isolation Forest model to generate anomaly scores for transactions.
3. **Explainable AI (XAI):** Utilize Groq LLM to provide human-readable reasoning for fraud detection results.
4. **Premium UI/UX:** Create a "vibe-centric" frontend with glassmorphism, neon highlights, and smooth Framer Motion animations.
5. **End-to-End Integration:** Connect React frontend to FastAPI backend for real-time transaction processing.

## Non-Goals (Out of Scope)
- Direct integration with real-world banking APIs (uses simulated input for now).
- Complex user authentication and role-based access control.
- Training complex neural networks (focus is on multi-agent logic and standard ML models).

## Users
- Financial analysts monitoring transaction risks.
- Developers looking for a template of explainable multi-agent systems.

## Constraints
- **Backend:** FastAPI, LangChain, Pandas, Scikit-learn, Groq API, **Supabase (PostgreSQL)** (on Render).
- **Frontend:** React, Tailwind CSS, Framer Motion, **Supabase Client** (on Vercel).
- **Design:** Dark mode fintech aesthetic, glassmorphism.
- **Model:** Groq Llama/Mixtral models for reasoning.

## Success Criteria
- [ ] Multi-agent chain successfully processes transaction JSON input.
- [ ] Isolation Forest detects anomalies with configurable sensitivity.
- [ ] Reasonant agent provides clear justifications for risk levels.
- [ ] Frontend displays sequential "Thinking" states and pulse animations for high-risk flags.
- [ ] Successfully deployed to Render and Vercel.
