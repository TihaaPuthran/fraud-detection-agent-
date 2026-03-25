@echo off
echo Starting Fraud Sentinel...
echo.

echo [1/2] Starting Backend on port 8008...
start /B python -m uvicorn app.main:app --host 127.0.0.1 --port 8008

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend on port 5188...
cd frontend
start /B npm run dev -- --port 5188

timeout /t 5 /nobreak >nul

echo.
echo ================================================
echo Fraud Sentinel is running!
echo.
echo Frontend: http://127.0.0.1:5188
echo Backend:  http://127.0.0.1:8008
echo.
echo Press any key to open in browser...
pause >nul

start http://127.0.0.1:5188
