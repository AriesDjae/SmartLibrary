@echo off
REM SmartLibrary AI Services Startup Script for Windows

echo 🚀 Starting SmartLibrary AI Services...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy env.example .env
    echo 📝 Please edit .env file with your configuration before running again.
    echo    Required: MONGODB_URI, OPENAI_API_KEY
    echo    For MongoDB Atlas, update MONGODB_URI in .env file
    pause
    exit /b 1
)

REM Start the application
echo 🎯 Starting AI Services on port 5001...
python run.py

pause 