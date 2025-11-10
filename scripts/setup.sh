#!/bin/bash
# Setup script for Nefarm AI project

set -e  # Exit on error

echo "🚀 Nefarm AI - Setup Script"
echo "=============================="
echo ""

# Check Python version
echo "📌 Checking Python version..."
python_version=$(python --version 2>&1 | awk '{print $2}')
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Error: Python $required_version or higher is required"
    echo "   Current version: $python_version"
    exit 1
fi
echo "✅ Python $python_version detected"
echo ""

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate
echo "✅ Virtual environment activated"
echo ""

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1
echo "✅ pip upgraded"
echo ""

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Install browser-use
echo "🌐 Installing browser-use..."
pip install browser-use
uvx browser-use install
echo "✅ browser-use installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  IMPORTANT: Edit .env and add your API keys!"
else
    echo "✅ .env file already exists"
fi
echo ""

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"
echo ""

# Check for API keys
echo "🔑 Checking API keys..."
if grep -q "your_key_here" .env 2>/dev/null; then
    echo "⚠️  WARNING: API keys not configured in .env"
    echo "   Please edit .env and add:"
    echo "   - BROWSER_USE_API_KEY (get $10 free at https://browser-use.com/)"
    echo "   - GOOGLE_API_KEY or ANTHROPIC_API_KEY"
else
    echo "✅ API keys appear to be configured"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
if pytest tests/ -v; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed (this is OK if you haven't implemented MCPs yet)"
fi
echo ""

echo "=============================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys"
echo "2. Start development:"
echo "   - Run API: uvicorn src.api_gateway.main:app --reload"
echo "   - Run tests: pytest"
echo "   - Build Docker: docker-compose up"
echo ""
echo "📚 Documentation: docs/2. arquitetura-tecnica/"
echo "=============================="
