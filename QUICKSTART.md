# Quick Start Guide - Dev Hunter

## 📁 Monorepo Structure

This project uses a **monorepo** structure with frontend and backend in the same repository:

```
dev-hunter-01/                  # Project root
├── App.tsx, index.tsx, etc.   # Frontend files (React/TypeScript)
├── components/                 # Frontend components
├── services/                   # Frontend services (API, Gemini)
├── package.json               # Frontend dependencies + monorepo scripts
├── vite.config.ts             # Frontend build config
├── backend/                    # Backend module
│   ├── src/                   # Java source code
│   ├── pom.xml                # Maven dependencies
│   └── Dockerfile             # Backend container
├── docker-compose.yml         # Orchestrates both services
└── README.md                  # Main documentation
```

**Why Monorepo?**
- ✅ Single repository for full-stack application
- ✅ Shared documentation and configuration
- ✅ Easy Docker Compose orchestration
- ✅ Simplified deployment

## Prerequisites

1. **Docker Desktop** must be installed and running
   - Download: https://www.docker.com/products/docker-desktop
   - **IMPORTANT**: Install Docker Desktop 4.0.0 or newer for `docker compose` support
   - Open Docker Desktop app and ensure it's running (whale icon in menu bar)
   - Verify installation: `docker --version` (should show version 20.10.0 or higher)

2. **Node.js 18+** for frontend
   - Check: `node -v`

### Docker Version Check

 bash
# Check your Docker version
docker --version

# If version is older than 20.10.0, update Docker Desktop
# Download latest from: https://www.docker.com/products/docker-desktop
 

## Starting the Application

### Option 1: Using the Startup Script (Easiest)

 bash
# From project root
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# Make script executable (first time only)
chmod +x start-backend.sh

# Run the script
./start-backend.sh
 

### Option 2: Manual Commands

**For Docker Desktop 4.0+ (Recommended)**:
 bash
# From project root
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# Start backend services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f postgres
 

**For Older Docker Versions**:
 bash
# From project root
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# Install docker-compose plugin first
brew install docker-compose

# Then start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres
 

**Note**: If you get "unknown shorthand flag: 'd' in -d" error, your Docker version is outdated. Please update Docker Desktop or use the older `docker-compose` command above.

### Start Frontend

 bash
# From project root (in a new terminal)
cd /Users/rmorales/WebStormProjects/dev-hunter-01

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
 

## Access Points

Once everything is running:

- **Frontend**: http://localhost:5173 (or port shown by Vite)
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

## Verification

### Check Backend is Running

 bash
# Quick health check
curl http://localhost:8080/actuator/health

# Should return: {"status":"UP"}
 

### Check Frontend Connection

1. Open http://localhost:5173 in your browser
2. Look for connection indicator in top-right corner
3. Should show: 🟢 "Backend Connected"

## Troubleshooting

### "command not found: docker-compose"

**Solution**: Use `docker compose` (with space) instead:

 bash
# ✅ Correct (new Docker Desktop)
docker compose up -d

# ❌ Old syntax (may not work)
docker-compose up -d
 

### "Cannot connect to the Docker daemon"

**Solution**: Start Docker Desktop application

1. Open Docker Desktop from Applications
2. Wait for it to fully start (whale icon in menu bar)
3. Try again

### Backend services won't start

**Check logs**:
 bash
docker compose logs backend
docker compose logs postgres
 

**Common fixes**:
 bash
# Stop all services
docker compose down

# Remove volumes and restart fresh
docker compose down -v
docker compose up -d
 

### Frontend shows "Offline Mode"

**Possible causes**:

1. Backend not running
    bash
   # Check backend status
   docker compose ps
   
   # Restart backend if needed
   docker compose restart backend
    

2. CORS issue
   - Check browser console for errors
   - Verify backend logs: `docker compose logs backend`

3. Wrong API URL
   - Check `.env.local` has: `VITE_API_BASE_URL=http://localhost:8080/v1`

### Port already in use

**If port 8080 or 5432 is already in use**:

 bash
# Find what's using port 8080
lsof -i :8080

# Find what's using port 5432 (PostgreSQL)
lsof -i :5432

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
 

## Stopping Services

### Stop Backend

 bash
# Stop services (keeps data)
docker compose down

# Stop and remove all data
docker compose down -v
 

### Stop Frontend

Press `Ctrl+C` in the terminal running `npm run dev`

## Development Workflow

### Typical Day

 bash
# Morning: Start everything
cd /Users/rmorales/WebStormProjects/dev-hunter-01
./start-backend.sh
npm run dev

# Work on frontend - hot reload works automatically

# Need to update backend?
docker compose restart backend

# Evening: Stop everything
docker compose down
# Press Ctrl+C in frontend terminal
 

## Common Commands Reference

 bash
# Backend Services
docker compose up -d              # Start services
docker compose down               # Stop services
docker compose ps                 # Check status
docker compose logs -f backend    # View backend logs
docker compose logs -f postgres   # View database logs
docker compose restart backend    # Restart backend only

# Frontend
npm run dev                       # Start dev server
npm run build                     # Build for production
npm test                          # Run tests

# Database Access
docker exec -it devhunter-postgres psql -U devhunter -d devhunter

# View API Documentation
open http://localhost:8080/swagger-ui.html
 

## Next Steps

1. ✅ Start backend: `./start-backend.sh` or `docker compose up -d`
2. ✅ Start frontend: `npm run dev`
3. ✅ Open http://localhost:5173
4. ✅ Verify 🟢 "Backend Connected" appears in Dashboard

For detailed API integration information, see [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)

