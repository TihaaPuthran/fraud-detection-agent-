# AI Multi-Agent Financial Fraud Detection System

A LangChain-powered multi-agent AI architecture that detects fraudulent transactions using ML models and LLM-generated explanations.

## Tech Stack

**Backend:** Python, FastAPI, LangChain, Scikit-learn, Groq LLM  
**Frontend:** React, Tailwind CSS, Framer Motion  
**ML:** RandomForest, XGBoost, Isolation Forest

## Features

- Multi-agent pipeline: Data Analyzer → Anomaly Detection → LLM Reasoning → Alert
- Real-time fraud analysis with explainable AI insights
- Conversational chatbot for fraud queries
- Dark fintech dashboard with glassmorphism UI
- Risk visualization with animated states

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Add your GROQ_API_KEY to .env

pip install -r requirements.txt
python run_training.py  # Train ML models
uvicorn app.main:app --reload --port 5555
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/analyze` | POST | Analyze transaction |
| `/chat` | POST | Chatbot Q&A |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config
│   │   ├── ml/           # ML pipeline
│   │   └── services/     # Business logic
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/   # React components
│       └── context/      # State management
└── agents.md             # Agent definitions
```

## License

MIT
