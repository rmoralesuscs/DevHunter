#!/bin/bash
# Quick start script for Dev Hunter backend services

echo "🚀 Starting Dev Hunter Backend Services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running."
    echo ""
    echo "Please start Docker Desktop:"
    echo "  1. Open Docker Desktop from Applications"
    echo "  2. Wait for the whale icon to appear in your menu bar"
    echo "  3. Wait until it says 'Docker Desktop is running'"
    echo "  4. Run this script again"
    echo ""
    echo "To check if Docker is running:"
    echo "  docker ps"
    echo ""
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to project root
cd "$(dirname "$0")"

# Check if .env file exists in backend directory
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No backend/.env file found. Creating from example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from example. Please edit it with your credentials."
    fi
fi

# Try docker compose (new syntax) first, fallback to docker-compose
if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
    echo "📦 Using 'docker compose' command..."
    docker compose up -d
elif command -v docker-compose &> /dev/null; then
    echo "📦 Using 'docker-compose' command..."
    docker-compose up -d
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' command found."
    echo ""
    echo "Please install docker-compose:"
    echo "  brew install docker-compose"
    echo ""
    echo "Or update Docker Desktop to 4.0.0 or newer:"
    echo "  https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Wait a moment for services to start
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check status
echo ""
echo "📊 Service Status:"
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    docker compose ps
elif command -v docker-compose &> /dev/null; then
    docker-compose ps
fi

echo ""
echo "✅ Backend services started!"
echo ""
echo "🌐 Access points:"
echo "   - Backend API: http://localhost:8080"
echo "   - Swagger UI: http://localhost:8080/swagger-ui.html"
echo "   - Health Check: http://localhost:8080/actuator/health"
echo ""
echo "📝 To view logs:"
if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
    echo "   docker compose logs -f backend"
    echo "   docker compose logs -f postgres"
    echo ""
    echo "🛑 To stop services:"
    echo "   docker compose down"
else
    echo "   docker-compose logs -f backend"
    echo "   docker-compose logs -f postgres"
    echo ""
    echo "🛑 To stop services:"
    echo "   docker-compose down"
fi

