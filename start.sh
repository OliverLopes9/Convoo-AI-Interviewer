#!/bin/bash

echo "🚀 Starting Convoo - AI Mock Interviewer"
echo "========================================"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env file not found!"
    echo "   Please create backend/.env with your OpenAI API key:"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    echo "   PORT=5000"
    echo "   NODE_ENV=development"
    echo ""
fi

# Start backend
echo "📡 Starting backend server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Convoo is now running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
