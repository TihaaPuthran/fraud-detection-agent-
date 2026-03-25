import os
import json
import re
import requests
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.core.config import settings


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = Field(
        default=None, description="Current prediction context"
    )


class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[str]] = Field(default=None)


class FraudChatbot:
    def __init__(self):
        self.api_key = None
        self.session = None
        self._initialize()

    def _initialize(self):
        self.api_key = settings.GROQ_API_KEY

        if not self.api_key or self.api_key == "your_groq_api_key_here":
            print("[Chatbot] GROQ_API_KEY not set. Using fallback responses.")
            return

        try:
            self.session = requests.Session()
            self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})
            print("[Chatbot] Groq API client initialized.")
        except Exception as e:
            print(f"[Chatbot] Error initializing Groq client: {e}")

    def _call_groq(self, system_prompt: str, user_prompt: str) -> str:
        if not self.session:
            raise Exception("Groq client not initialized")

        response = self.session.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.5,
                "max_tokens": 800,
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    def _get_context_summary(self, context: Optional[Dict[str, Any]]) -> str:
        if not context:
            return "No recent transaction analysis available."

        parts = []
        parts.append("CURRENT TRANSACTION ANALYSIS:")
        parts.append(f"- Fraud Probability: {context.get('fraud_probability', 'N/A')}")
        parts.append(f"- Risk Level: {context.get('risk_level', 'N/A')}")
        parts.append(f"- Model Confidence: {context.get('model_confidence', 'N/A')}")
        parts.append(f"- Recommendation: {context.get('recommendation', 'N/A')}")

        if context.get("explanation"):
            parts.append(f"- Explanation: {context.get('explanation')}")

        if context.get("key_factors"):
            factors = context.get("key_factors", [])
            if isinstance(factors, list):
                parts.append("- Key Factors:")
                for f in factors:
                    parts.append(f"  * {f}")

        model_info = context.get("model_info", {})
        if model_info:
            parts.append(f"- Model: {model_info.get('name', 'N/A')}")
            parts.append(f"- Precision: {model_info.get('precision', 'N/A')}%")
            parts.append(f"- Recall: {model_info.get('recall', 'N/A')}%")

        return "\n".join(parts)

    def _get_system_prompt(self, has_context: bool) -> str:
        base = """You are an AI Fraud Analyst Assistant / Fraud Intelligence Copilot.
You help users understand fraud detection results, model outputs, and fraud-related concepts.
You are knowledgeable, professional, and explain things in simple, clear language.

RULES:
1. Always be helpful and informative about fraud detection
2. Explain technical concepts in simple terms
3. If there's current transaction data, use it to answer contextually
4. If no transaction data, answer general fraud/system questions
5. Never make up information not supported by the context
6. Be concise but thorough
7. Focus on fraud detection domain knowledge

AVAILABLE TOPICS:
- Explaining prediction results (fraud_probability, risk_level, confidence)
- Explaining what HIGH/MEDIUM/LOW risk means
- Explaining why a transaction was flagged
- What factors increased the fraud score
- What actions to take based on risk level
- How the ML model works (RandomForest, features used)
- What the multi-agent system does
- General fraud detection concepts
- Understanding model metrics (precision, recall, F1-score)"""

        if has_context:
            base += """

CURRENT CONTEXT:
You have access to the current transaction analysis results. Use this data to provide
contextual answers when users ask about their specific analysis."""

        return base

    def generate_response(
        self, message: str, context: Optional[Dict[str, Any]] = None
    ) -> str:
        has_context = context is not None
        context_summary = self._get_context_summary(context) if has_context else ""

        system_prompt = self._get_system_prompt(has_context)

        if has_context:
            user_prompt = f"""CONTEXT:
{context_summary}

USER QUESTION:
{message}

Please answer based on the context provided. If the question is about the current transaction, use the context data. If it's a general question, explain the concept clearly."""
        else:
            user_prompt = f"""USER QUESTION:
{message}

Please answer this fraud-related question. If you need more information, ask a clarifying question."""

        if not self.session:
            return self._fallback_response(message, context)

        try:
            response = self._call_groq(system_prompt, user_prompt)
            return response.strip()
        except Exception as e:
            print(f"[Chatbot] Error generating response: {e}")
            return self._fallback_response(message, context)

    def _fallback_response(
        self, message: str, context: Optional[Dict[str, Any]]
    ) -> str:
        msg_lower = message.lower()

        if "how does the model work" in msg_lower or "what model" in msg_lower:
            return "The fraud detection system uses a RandomForest ML model trained on transaction patterns. It analyzes features like amount, time, location, and spending history to calculate a fraud probability. The model was trained on 40,000 transactions with 5% fraud rate, achieving 73% recall and 12% precision."

        if "what does" in msg_lower and (
            "risk" in msg_lower
            or "high" in msg_lower
            or "medium" in msg_lower
            or "low" in msg_lower
        ):
            if context and context.get("risk_level"):
                level = context.get("risk_level")
                if level == "HIGH":
                    return f"Current risk is HIGH ({context.get('fraud_probability', 0) * 100:.1f}% fraud probability). This means the transaction shows multiple suspicious patterns that warrant blocking or manual review. The system recommends: {context.get('recommendation', 'Block transaction')}."
                elif level == "MEDIUM":
                    return f"Current risk is MEDIUM ({context.get('fraud_probability', 0) * 100:.1f}% fraud probability). The transaction shows some unusual patterns but isn't clearly fraudulent. The system recommends: {context.get('recommendation', 'Monitor closely')}."
                else:
                    return f"Current risk is LOW ({context.get('fraud_probability', 0) * 100:.1f}% fraud probability). The transaction appears normal based on learned patterns. The system recommends: {context.get('recommendation', 'Allow transaction')}."
            return "Risk levels indicate how suspicious a transaction is:\n- HIGH: Multiple red flags detected, recommend blocking\n- MEDIUM: Some unusual patterns, recommend monitoring\n- LOW: Transaction looks normal, recommend allowing"

        if (
            "why flagged" in msg_lower
            or "why risk" in msg_lower
            or "why is" in msg_lower
            or "what factors" in msg_lower
        ):
            if context and context.get("key_factors"):
                factors = context.get("key_factors", [])
                if isinstance(factors, list):
                    return "Key factors that influenced the fraud score:\n" + "\n".join(
                        f"• {f}" for f in factors
                    )
            return "The ML model analyzes multiple features to calculate fraud probability. Common factors include transaction amount relative to average, unusual timing, and deviation from spending patterns."

        if "confidence" in msg_lower:
            conf = context.get("model_confidence", 0) if context else 0
            return f"Model confidence ({conf * 100:.0f}%) indicates how certain the model is about its prediction. Higher confidence means the transaction features are very similar to patterns seen during training. Lower confidence means the transaction is unusual but not definitively fraudulent."

        if (
            "what should" in msg_lower
            or "what to do" in msg_lower
            or "recommend" in msg_lower
        ):
            rec = (
                context.get("recommendation", "Allow transaction")
                if context
                else "Allow transaction"
            )
            return f"Based on the current analysis, the recommendation is: **{rec}**. This decision was made by the AI based on the fraud probability and risk level."

        if "explain" in msg_lower and "simple" in msg_lower:
            if context:
                prob = context.get("fraud_probability", 0) * 100
                level = context.get("risk_level", "LOW")
                return f"Simply put: This transaction has a {prob:.1f}% chance of being fraudulent, so we classify it as {level} risk. {context.get('explanation', 'The model analyzed patterns and found this result.')}"
            return "The system analyzes transactions using machine learning to estimate fraud risk. Lower percentages mean safer transactions. Risk levels help decide whether to allow, monitor, or block."

        if "agents" in msg_lower or "what does the system do" in msg_lower:
            return "The multi-agent system consists of:\n• Data Analyzer: Validates and structures transaction data\n• Anomaly Detector: Applies ML to find unusual patterns\n• Reasoning Agent: Explains why a risk level was assigned\n• Alert Agent: Formats warnings based on risk\n• Report Generator: Compiles final results"

        if "precision" in msg_lower or "recall" in msg_lower or "f1" in msg_lower:
            if context and context.get("model_info"):
                mi = context.get("model_info", {})
                return f"Model metrics:\n• Precision: {mi.get('precision', 12):.1f}% - How accurate positive predictions are\n• Recall: {mi.get('recall', 73):.1f}% - How many frauds we catch\n• F1-Score: {mi.get('f1_score', 20):.1f}% - Balance between precision and recall"
            return "Model metrics show performance:\n• Precision = True Positives / (TP + FP) - accuracy of fraud predictions\n• Recall = True Positives / (TP + FN) - how many frauds we detect\n• F1 = 2 × Precision × Recall / (Precision + Recall)"

        return "I'm here to help explain fraud detection results. You can ask me about:\n• Why a transaction was flagged\n• What HIGH/MEDIUM/LOW risk means\n• How the model works\n• What factors influenced the score\n• What actions to take\n\nIs there something specific about fraud detection you'd like to understand?"


fraud_chatbot = FraudChatbot()
