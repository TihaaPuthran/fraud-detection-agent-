# ROADMAP.md

> **Current Phase**: Not started
> **Milestone**: v1.0 - Foundation & Multi-Agent MVP

## Must-Haves (from SPEC)
- [ ] LangChain orchestration with multiple agents.
- [ ] Isolation Forest anomaly detection model.
- [ ] Explainable reasoning using Groq API.
- [ ] Premium "Dark Fintech" React dashboard with animations.
- [ ] Integrated FastAPI backend.

## Phases

### Phase 1: Foundation (Backend & ML)
**Status**: ⬜ Not Started
**Objective**: Build the core anomaly detection engine and set up the FastAPI server.
**Requirements**: REQ-02, REQ-05, REQ-08
- Setup Python virtual environment and dependencies.
- Implement training script for Isolation Forest model.
- Create FastAPI "lifespan" server to load model and serve basic inference endpoint.
- Serialize model with joblib.

### Phase 2: Multi-Agent Orchestration (LangChain)
**Status**: ⬜ Not Started
**Objective**: Implement the intelligent reasoning layer using LangChain LCEL.
**Requirements**: REQ-01, REQ-03, REQ-04, REQ-07, REQ-10
- Set up LangChain and LLM (Groq) integration.
- Implement specialized agents: Data Analyzer, Anomaly Indicator, Reasoner, Alerter.
- Use LCEL to chain agents sequentially.
- Ensure structured JSON response for every transaction.

### Phase 3: Frontend Development (Vibe UI)
**Status**: ⬜ Not Started
**Objective**: Build the premium dashboard with React and Framer Motion.
**Requirements**: REQ-06, REQ-07, REQ-09
- Scaffold React project with Vite, Tailwind CSS, and Framer Motion.
- Implement "Dark Fintech" theme with glassmorphism components.
- Build interactive transaction form and real-time results display.
- Add "Thinking..." step-by-step animations for agent processing.

### Phase 4: Integration & Polish
**Status**: ⬜ Not Started
**Objective**: Final end-to-end integration and deployment readiness.
**Requirements**: REQ-05, REQ-06, REQ-11
- Connect backend API endpoints to the React frontend.
- Implement error handling and UI loading states.
- Final aesthetic polish (neon glow, neon highlights).
- Deploy to Render (Backend) and Vercel (Frontend).
