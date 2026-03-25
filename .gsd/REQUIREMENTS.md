# REQUIREMENTS.md

## Functional Requirements
| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| REQ-01 | Implement multi-agent chain (Data Analyzer -> Anomaly Detector -> Reasoning -> Alert -> Report) using LangChain LCEL. | SPEC goal 1, 3 | Pending |
| REQ-02 | Develop an anomaly detection model using Scikit-learn's Isolation Forest that returns an anomaly score and risk level. | SPEC goal 2 | Pending |
| REQ-03 | Integrate Groq LLM API to generate human-readable explanations based on transaction data and anomaly scores. | SPEC goal 3 | Pending |
| REQ-04 | Provide a structured JSON output from the agent chain containing risk level, anomaly score, and explanation. | SPEC goal 1 | Pending |
| REQ-05 | Build a FastAPI backend with proper endpoint modeling and lifespan-based ML model loading. | SPEC goal 5 | Pending |
| REQ-06 | Create a React frontend with a dark theme, glassmorphism UI, and neon accent colors. | SPEC goal 4 | Pending |
| REQ-07 | Implement Framer Motion animations for sequential "Thinking" feedback for each agent step. | SPEC goal 4 | Pending |
| REQ-12 | Integrate Supabase (PostgreSQL) for storing transaction history and fraud detection results. | SPEC goal 5 | Pending |

## Non-Functional Requirements
| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| REQ-08 | High-performance inference (Isolation Forest) with minimal latency on CPU. | SPEC constraint | Pending |
| REQ-09 | Responsive web design using Tailwind CSS for dashboard elements. | SPEC goal 4 | Pending |
| REQ-10 | Modular backend architecture allowing easy swap of agents or tools. | SPEC constraint | Pending |
| REQ-11 | Secure API communication with Groq and internal endpoints. | SPEC constraint | Pending |
