#!/bin/bash

echo "🚀 Starting OmniPost AI - Social Media Management Platform"
echo "=================================================="

# Kill any existing processes
echo "🔄 Stopping existing processes..."
pkill -f "vite" 2>/dev/null
pkill -f "node.*index.js" 2>/dev/null

# Start backend
echo "🔧 Starting backend server..."
cd backend
node index.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ Backend server started successfully on http://localhost:5001"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend server started successfully on http://localhost:5173"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

echo ""
echo "🎉 OmniPost AI is now running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait 