@echo off
REM Setup script for Nefarm AI project (Windows)

echo =============================
echo Nefarm AI - Setup Script
echo =============================
echo.

REM Check Python
echo Checking Python version...
python --version 2>nul
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.11+
    exit /b 1
)
echo [OK] Python detected
echo.

REM Create virtual environment
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [OK] Virtual environment already exists
)
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip >nul 2>&1
echo [OK] pip upgraded
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Install browser-use
echo Installing browser-use...
pip install browser-use
uvx browser-use install
echo [OK] browser-use installed
echo.

REM Create .env file
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo [OK] .env file created
    echo [WARNING] Edit .env and add your API keys!
) else (
    echo [OK] .env file already exists
)
echo.

REM Create logs directory
if not exist logs mkdir logs
echo [OK] Logs directory ready
echo.

REM Check API keys
echo Checking API keys...
findstr /C:"your_key_here" .env >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] API keys not configured in .env
    echo Please edit .env and add:
    echo - BROWSER_USE_API_KEY
    echo - GOOGLE_API_KEY or ANTHROPIC_API_KEY
) else (
    echo [OK] API keys appear to be configured
)
echo.

REM Run tests
echo Running tests...
pytest tests\ -v
if errorlevel 1 (
    echo [WARNING] Some tests failed
    echo This is OK if you haven't implemented MCPs yet
) else (
    echo [OK] All tests passed
)
echo.

echo =============================
echo Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your API keys
echo 2. Start development:
echo    - API: uvicorn src.api_gateway.main:app --reload
echo    - Tests: pytest
echo    - Docker: docker-compose up
echo.
echo Documentation: docs\2. arquitetura-tecnica\
echo =============================
pause
