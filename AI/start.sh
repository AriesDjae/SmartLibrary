#!/bin/bash

# SmartLibrary AI Services Startup Script

echo "🚀 Starting SmartLibrary AI Services..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    echo "   Required: MONGODB_URI, OPENAI_API_KEY"
    exit 1
fi

# Check if MongoDB is running (optional)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Please start MongoDB or use MongoDB Atlas."
        echo "   To start MongoDB locally: sudo systemctl start mongod"
        echo "   Or update MONGODB_URI in .env to use MongoDB Atlas"
    else
        echo "✅ MongoDB is running"
    fi
fi

# Start the application
echo "🎯 Starting AI Services on port 5001..."
python run.py 