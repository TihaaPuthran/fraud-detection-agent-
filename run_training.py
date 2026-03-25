import sys
import os

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from backend.app.services.model_trainer import train_pipeline

if __name__ == "__main__":
    print("Starting fraud detection model training...")
    train_pipeline(n_samples=100000, fraud_ratio=0.02, retrain=True)
