@echo off
title Raja Rajeshwara Engineerings Launcher
set PATH=%~dp0node-bin;%PATH%
echo ====================================================================
echo  Raja Rajeshwara Engineerings - Full Stack Web Application Launcher
echo ====================================================================
echo.

:: 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your system environment PATH.
    echo Please install Python 3.x and ensure "Add Python to PATH" is checked.
    echo.
    pause
    exit /b
)
echo [OK] Python is available.

:: 2. Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Node.js is not found in your PATH.
    echo To run the React Frontend and the Node.js API Gateway, Node.js is required.
    echo.
    set /p install_node="Would you like to install Node.js now using Winget? (Y/N): "
    if /i "%install_node%"=="Y" (
        echo.
        echo Launching Node.js installation...
        echo Please accept the Windows User Account Control (UAC) elevation prompt if it appears.
        winget install --accept-source-agreements --accept-package-agreements OpenJS.NodeJS
        echo.
        echo [SUCCESS] Node.js installer has completed.
        echo IMPORTANT: You MUST close this command prompt and open a NEW one to refresh PATH environment variables.
        echo After opening a new command prompt, run 'run.bat' again.
        echo.
        pause
        exit /b
      ) else (
        echo.
        echo [ERROR] Cannot proceed without Node.js. Please install Node.js manually from https://nodejs.org/
        echo.
        pause
        exit /b
    )
)
echo [OK] Node.js is available.

:: 3. Setup Python Backend Virtual Environment if missing
if not exist "backend-python\.venv" (
    echo.
    echo [INFO] Setting up Python backend virtual environment...
    cd backend-python
    python -m venv .venv
    call .venv\Scripts\activate
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    cd ..
)

:: 4. Start Python calculation backend
echo.
echo [INFO] Launching Python Calculation Backend (Port 8000)...
start "Python Calculation Backend" cmd /k "cd backend-python && .venv\Scripts\activate && python app.py"

:: 5. Install Node backend dependencies and start
echo [INFO] Launching Node.js API Gateway (Port 5000)...
start "Node.js API Gateway" cmd /k "cd backend-node && npm install && npm start"

:: 6. Install Frontend dependencies and start
echo [INFO] Launching React Frontend (Port 5173)...
start "React Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ====================================================================
echo  All services are launching in separate windows!
echo  - React Frontend:    http://localhost:5173
echo  - Node.js API:       http://localhost:5000
echo  - Python Backend:    http://localhost:8000
echo ====================================================================
echo.
echo Press any key to exit this launcher window (services will keep running).
pause >nul
