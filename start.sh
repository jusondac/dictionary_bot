#!/bin/bash

# Discord Dictionary Bot Startup Script
echo "🚀 Starting Discord Dictionary Bot..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Please copy .env.example to .env and fill in your Discord token:"
    echo "   cp .env.example .env"
    echo "   Then edit .env with your actual Discord bot token"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the bot
echo "🤖 Launching bot..."
npm start
