# RESEARCH.md — Architecture & Technology Research

## 1. Multi-Agent Orchestration (LangChain LCEL)
**Findings:**
- **LCEL (LangChain Expression Language):** The modern way to build chains using the pipe `|` operator. It's more composable and supports streaming/batching out of the box compared to the legacy `SequentialChain`.
- **Custom Runnables:** Each agent (e.g., Anomaly Detector) can be implemented as a `RunnableLambda` or a custom class inheriting from `Runnable`.
- **Workflow:**
    ```python
    chain = data_analyzer | anomaly_detector | reasoning_agent | alert_agent | report_generator
    ```

## 2. ML Model Serving (FastAPI + Scikit-learn)
**Findings:**
- **Lifespan Context Manager:** Use FastAPI's `lifespan` to load the `IsolationForest` model into the application state once during startup.
- **Serialization:** `joblib` is faster and more efficient for scikit-learn models than `pickle`.
- **Asynchronous Execution:** Ensure ML inference is handled in a way that doesn't block the event loop (though Isolation Forest is usually fast enough for CPU inference).

## 3. UI/UX & Animations (React + Framer Motion)
**Findings:**
- **Sequential Feedback:** Use Framer Motion's `variants` with `delayChildren` and `staggerChildren` to create a "reveal" effect for agent processing steps.
- **Glassmorphism:** Use Tailwind utility classes: `bg-white/10 backdrop-blur-md border border-white/20`.
- **Thinking State:** A typing effect or pulsating indicators for each agent's status ("Analyzing data...", "Detecting anomalies...") enhances the "AI vibe."

## 4. Groq LLM Integration
**Findings:**
- **Models:** Recommend `llama3-70b-8192` for high-quality reasoning or `llama3-8b-8192` for low latency.
- **System Prompts:** Use structured output (JSON) for the final response to ensure the frontend can parse it reliably.
