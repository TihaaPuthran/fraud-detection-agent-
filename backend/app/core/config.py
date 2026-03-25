from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    MODEL_PATH: str = "backend/app/models/isolation_forest.joblib"

    class Config:
        env_file = "../../.env"


settings = Settings()
