import subprocess
import time
import requests
import sys
import os

# Start backend
print("Starting backend...")
backend_proc = subprocess.Popen(
    [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        "127.0.0.1",
        "--port",
        "5555",
    ],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    shell=False,
)

# Wait for backend to start
time.sleep(5)

# Test backend
try:
    resp = requests.get("http://127.0.0.1:5555/health", timeout=5)
    print(f"Backend /health: {resp.status_code} - {resp.json()}")
except Exception as e:
    print(f"Backend /health failed: {e}")
    backend_proc.terminate()
    sys.exit(1)

# Start frontend using cmd
print("Starting frontend...")
frontend_proc = subprocess.Popen(
    ["cmd", "/c", "npm", "run", "dev"],
    cwd="frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    shell=False,
)

# Wait for frontend
time.sleep(8)

print("\n" + "=" * 50)
print("SERVERS RUNNING:")
print("  Backend: http://127.0.0.1:5555")
print("  Frontend: http://127.0.0.1:5173")
print("=" * 50)
print("\nTest /analyze via backend:")
try:
    data = {
        "user_id": "test1",
        "amount": 200,
        "location": "Mumbai",
        "time": "14:00",
        "avg_spending": 150,
    }
    resp = requests.post("http://127.0.0.1:5555/analyze", json=data, timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
except Exception as e:
    print(f"Failed: {e}")

print("\nPress Ctrl+C to stop servers...")

# Keep running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
    print("Done")
