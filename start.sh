#!/bin/bash
set -e

echo "🚀 Dev Hunter - Quick Start Script"
echo "=================================="
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites checked"
echo ""

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your cloud storage credentials"
    echo ""
fi

# Create frontend .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local for frontend..."
    cat > .env.local << EOF
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_API_BASE_URL=http://localhost:8080/v1
EOF
    echo "⚠️  Please edit .env.local with your Gemini API key"
    echo ""
fi

# Start backend services
echo "🐳 Starting PostgreSQL and Backend..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if backend is up
until curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; do
    echo "   Waiting for backend..."
    sleep 5
done

echo "✅ Backend is healthy!"
echo ""

# Install frontend dependencies if needed
if [ ! -d node_modules ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🎉 Dev Hunter is ready!"
echo ""
echo "📍 Access points:"
echo "   Frontend:   http://localhost:5173 (run 'npm run dev')"
echo "   Backend:    http://localhost:8080"
echo "   Swagger UI: http://localhost:8080/swagger-ui.html"
echo "   Health:     http://localhost:8080/actuator/health"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env with your storage provider credentials"
echo "   2. Edit .env.local with your Gemini API key"
echo "   3. Run 'npm run dev' to start the frontend"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Run tests:        cd backend && mvn test"
echo ""

