from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.schemas import TransactionInput, TransactionOutput, HealthResponse
from app.services.fraud_prediction_service import fraud_service
from app.services.reasoning_service import reasoning_service
from app.services.chatbot_service import ChatRequest, ChatResponse, fraud_chatbot


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model_loaded = True
    app.state.fraud_service = fraud_service
    app.state.reasoning = reasoning_service
    yield


app = FastAPI(title="Fraud Detection API", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    model_info = fraud_service.get_model_info()
    return HealthResponse(
        status="healthy",
        model_loaded=True,
        model_name=model_info.get("model_name"),
        model_version=model_info.get("model_version"),
    )


@app.post("/analyze", response_model=TransactionOutput)
async def analyze_transaction(transaction: TransactionInput):
    input_dict = transaction.model_dump()

    print(f"\n[API] Received transaction: {input_dict}")

    fraud_result = fraud_service.predict(input_dict)

    print(f"[API] Fraud prediction: {fraud_result}")

    reasoning_result = reasoning_service.generate_reasoning(
        input_dict,
        fraud_result["fraud_probability"],
        fraud_result["risk_level"],
        fraud_result.get("model_confidence", 0),
    )

    print(f"[API] Reasoning generated: {reasoning_result}")

    model_info = fraud_service.get_model_info()
    metrics = model_info.get("metrics", {})

    return TransactionOutput(
        risk_level=fraud_result["risk_level"],
        anomaly_score=fraud_result["fraud_probability"],
        explanation=reasoning_result["explanation"],
        recommendation=reasoning_result["recommendation"],
        alert=f"{fraud_result['risk_level']} risk transaction detected",
        key_factors=reasoning_result["key_factors"],
        ui_meta={
            "color": "red"
            if fraud_result["risk_level"] == "HIGH"
            else "yellow"
            if fraud_result["risk_level"] == "MEDIUM"
            else "green",
            "animation": "pulse" if fraud_result["risk_level"] == "HIGH" else "fade",
            "severity": fraud_result["risk_level"].lower(),
        },
        model_info={
            "name": model_info.get("model_name"),
            "version": model_info.get("model_version"),
            "confidence": fraud_result.get("model_confidence"),
            "precision": metrics.get("precision", 0) * 100,
            "recall": metrics.get("recall", 0) * 100,
            "f1_score": metrics.get("f1_score", 0) * 100,
        },
    )


@app.get("/model-info")
async def get_model_info():
    return fraud_service.get_model_info()


@app.post("/chat", response_model=ChatResponse)
async def chat_with_analyst(chat_request: ChatRequest):
    response = fraud_chatbot.generate_response(
        chat_request.message, chat_request.context
    )
    return ChatResponse(response=response)
