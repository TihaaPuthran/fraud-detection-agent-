import os
import json
import re
import requests
from pydantic import BaseModel, Field
from typing import Literal, List
from app.core.config import settings


class ReasoningOutput(BaseModel):
    explanation: str = Field(
        description="Human-readable explanation of why the transaction was flagged"
    )
    recommendation: Literal[
        "Block transaction", "Monitor closely", "Allow transaction"
    ] = Field(description="Recommended action based on risk assessment")
    key_factors: List[str] = Field(
        description="List of key factors that contributed to the risk score"
    )


class ReasoningService:
    def __init__(self):
        self.api_key = None
        self.session = None
        self._initialize()

    def _initialize(self):
        self.api_key = settings.GROQ_API_KEY

        if not self.api_key or self.api_key == "your_groq_api_key_here":
            print("Warning: GROQ_API_KEY not set. Using fallback reasoning.")
            return

        try:
            self.session = requests.Session()
            self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})
            print("Groq API client initialized successfully.")
        except Exception as e:
            print(f"Error initializing Groq client: {e}")

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
                "temperature": 0.3,
                "max_tokens": 500,
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    def generate_reasoning(
        self,
        transaction_data: dict,
        fraud_probability: float,
        risk_level: str,
        model_confidence: float = 0.5,
    ) -> dict:
        if not self.session:
            return self._fallback_reasoning(
                transaction_data, fraud_probability, risk_level, model_confidence
            )

        try:
            amount = transaction_data.get("amount", 0)
            avg_spending = transaction_data.get("avg_spending", 50)
            amount_ratio = amount / (avg_spending + 1) if avg_spending > 0 else 1.0

            system_prompt = """You are a fraud detection expert analyzing financial transactions.
Your role is to EXPLAIN the ML model's decision, not to make the decision yourself.
The ML model has already determined the risk level based on trained patterns.
Respond ONLY with valid JSON in this format:
{"explanation": "...", "recommendation": "Block transaction|Monitor closely|Allow transaction", "key_factors": ["factor1", "factor2"]}"""

            user_prompt = f"""ML Model Analysis Results:
- Fraud Probability: {fraud_probability:.4f} ({fraud_probability * 100:.1f}%)
- Risk Level: {risk_level}
- Model Confidence: {model_confidence:.4f}

Transaction Details:
- Amount: ${amount:.2f}
- Location: {transaction_data.get("location", "Unknown")}
- Time: {transaction_data.get("time", "12:00")}
- User's Average Spending: ${avg_spending:.2f}
- Amount to Average Ratio: {amount_ratio:.2f}x

Your task: Explain what the ML model detected based on these features. The model is trained on patterns of fraudulent transactions.

Respond with JSON only."""

            response = self._call_groq(system_prompt, user_prompt)

            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                return ReasoningOutput(
                    explanation=data.get("explanation", ""),
                    recommendation=data.get("recommendation", "Allow transaction"),
                    key_factors=data.get("key_factors", []),
                ).model_dump()

            return self._fallback_reasoning(
                transaction_data, fraud_probability, risk_level, model_confidence
            )

        except Exception as e:
            print(f"Error generating reasoning: {e}")
            return self._fallback_reasoning(
                transaction_data, fraud_probability, risk_level, model_confidence
            )

    def _fallback_reasoning(
        self,
        transaction_data: dict,
        fraud_probability: float,
        risk_level: str,
        model_confidence: float = 0.5,
    ) -> dict:
        amount = transaction_data.get("amount", 0)
        avg_spending = transaction_data.get("avg_spending", 50)
        amount_ratio = amount / (avg_spending + 1) if avg_spending > 0 else 1.0

        try:
            hour = int(transaction_data.get("time", "12:00").split(":")[0])
        except (ValueError, IndexError):
            hour = 12

        is_unusual_hour = hour < 6 or hour > 22
        is_high_amount = amount_ratio > 3

        if risk_level == "HIGH":
            recommendation = "Block transaction"
            explanation = f"ML model detected HIGH risk (probability: {fraud_probability * 100:.1f}%, confidence: {model_confidence * 100:.1f}%). The transaction shows multiple suspicious patterns that match known fraud indicators from training data."
            factors = [
                f"ML fraud probability: {fraud_probability * 100:.1f}%",
                f"Transaction amount ${amount:.2f} vs average ${avg_spending:.2f} ({amount_ratio:.1f}x)",
                "Unusual hour detected" if is_unusual_hour else "Normal hour",
                "High amount relative to spending history"
                if is_high_amount
                else "Amount within normal range",
            ]
        elif risk_level == "MEDIUM":
            recommendation = "Monitor closely"
            explanation = f"ML model detected MEDIUM risk (probability: {fraud_probability * 100:.1f}%, confidence: {model_confidence * 100:.1f}%). Some patterns deviate from normal behavior but are not conclusively fraudulent."
            factors = [
                f"ML fraud probability: {fraud_probability * 100:.1f}%",
                f"Transaction amount ${amount:.2f} vs average ${avg_spending:.2f} ({amount_ratio:.1f}x)",
                "Slightly unusual timing" if is_unusual_hour else "Normal timing",
                "Amount somewhat higher than usual"
                if amount_ratio > 1.5
                else "Amount relatively normal",
            ]
        else:
            recommendation = "Allow transaction"
            explanation = f"ML model detected LOW risk (probability: {fraud_probability * 100:.1f}%, confidence: {model_confidence * 100:.1f}%). Transaction patterns align with normal user behavior from training data."
            factors = [
                f"ML fraud probability: {fraud_probability * 100:.1f}%",
                f"Transaction amount ${amount:.2f} vs average ${avg_spending:.2f} ({amount_ratio:.1f}x)",
                "Normal transaction timing",
                "No significant deviation from spending patterns",
            ]

        return {
            "explanation": explanation,
            "recommendation": recommendation,
            "key_factors": factors,
        }


reasoning_service = ReasoningService()
