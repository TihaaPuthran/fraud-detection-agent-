from pydantic import BaseModel, Field
from typing import Optional, Literal


class TransactionInput(BaseModel):
    user_id: str = Field(..., description="Unique user identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    location: str = Field(..., description="Transaction location")
    time: str = Field(..., description="Transaction timestamp (HH:MM format)")
    avg_spending: float = Field(..., ge=0, description="User's average spending")


class TransactionOutput(BaseModel):
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    anomaly_score: float = Field(
        ..., ge=0, le=1, description="Fraud probability from ML model"
    )
    explanation: str
    recommendation: Literal["Block transaction", "Monitor closely", "Allow transaction"]
    alert: str
    key_factors: list[str]
    ui_meta: dict
    model_info: Optional[dict] = Field(default=None, description="Model metadata")


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: Optional[str] = None
    model_version: Optional[str] = None
