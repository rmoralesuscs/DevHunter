# Dev Hunter - AI-Powered Test Management Platform

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🏗️ Monorepo Architecture

This project uses a **clean monorepo structure** with completely separated frontend and backend packages:

```
dev-hunter-01/                      # Root workspace
│
├── 📁 frontend/                    # Frontend Package
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── index.html                  # Entry HTML
│   ├── index.tsx                   # React entry
│   ├── App.tsx                     # Main component
│   ├── components/                 # React components
│   ├── services/                   # API & AI services
│   └── utils/                      # Utilities
│
├── 📁 backend/                     # Backend Package
│   ├── pom.xml                     # Maven dependencies
│   ├── src/                        # Java source
│   │   ├── main/                   # Application code
│   │   └── test/                   # Tests
│   ├── Dockerfile                  # Container image
│   └── .env                        # Backend config
│
├── package.json                    # Root workspace manager
├── docker-compose.yml              # Orchestration
└── README.md                       # This file
```

### Why This Structure?

✅ **Clear Separation** - Each package is completely independent  
✅ **Standard Practice** - Matches industry-standard monorepo patterns  
✅ **Easy Navigation** - Developers immediately understand the layout  
✅ **No Conflicts** - Frontend and backend dependencies are isolated  
✅ **Scalable** - Easy to add more packages (mobile, admin, etc.)  

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** (for backend)
- **Node.js 18+** (for frontend)
- **Java 21** (optional, if running backend locally without Docker)

### 1. Install Dependencies

```bash
# From project root - installs both frontend and backend dependencies
npm install
```

This uses npm workspaces to install frontend dependencies automatically.

### 2. Start Backend (Docker)

```bash
# From project root
npm run docker:up

# Or manually
docker-compose up -d
```

**Backend will be available at:**
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

### 3. Start Frontend

```bash
# From project root
npm run dev

# Or from frontend directory
cd frontend
npm run dev
```

**Frontend will be available at:** http://localhost:5173

### 4. Verify Connection

Open http://localhost:5173 and look for:
- 🟢 **"Backend Connected"** in the top-right corner

## 📦 Package Scripts

### Root Level (Monorepo Commands)

```bash
# Frontend
npm run dev                 # Start frontend dev server
npm run build              # Build frontend for production
npm run dev:frontend       # Explicit frontend dev
npm run build:frontend     # Explicit frontend build

# Backend
npm run dev:backend        # Start backend with Maven
npm run build:backend      # Build backend with Maven
npm run test:backend       # Run backend tests

# Docker
npm run docker:up          # Start backend services
npm run docker:down        # Stop backend services
npm run docker:logs        # View backend logs
npm run docker:restart     # Restart backend container

# Utilities
npm run start              # Start everything (backend + frontend)
npm run install:all        # Install all dependencies
npm run clean              # Clean build artifacts
```

### Frontend Package

```bash
cd frontend

npm install                # Install dependencies
npm run dev                # Start dev server (port 5173)
npm run build              # Build for production
npm run preview            # Preview production build
```

### Backend Package

```bash
cd backend

mvn clean install          # Build with Maven
mvn spring-boot:run        # Run locally
mvn test                   # Run tests
```

## 🎯 Technology Stack

### Frontend (`frontend/`)
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Google Gemini AI** - AI features
- **Dexie** - Local IndexedDB storage

### Backend (`backend/`)
- **Java 21** - Programming language
- **Spring Boot 3.2** - Application framework
- **PostgreSQL 15** - Database
- **Flyway** - Database migrations
- **Azure/AWS/GCS** - Multi-cloud storage
- **OpenAPI/Swagger** - API documentation

## 🔌 API Integration

The frontend automatically connects to the backend API at `http://localhost:8080/v1`.

### Configuration

**Frontend** (`frontend/.env.local`):
```bash
VITE_API_BASE_URL=http://localhost:8080/v1
VITE_GEMINI_API_KEY=your-gemini-key
```

**Backend** (`backend/.env`):
```bash
DATABASE_URL=jdbc:postgresql://postgres:5432/devhunter
STORAGE_PROVIDER=azure
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Detailed setup guide
- **[STARTUP-CHECKLIST.md](STARTUP-CHECKLIST.md)** - Step-by-step startup
- **[FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)** - API integration guide
- **[backend/README.md](backend/README.md)** - Backend-specific documentation
- **[docs/openapi.yaml](docs/openapi.yaml)** - API specification

## 🧪 Development Workflow

### Working on Frontend Only

```bash
# Start frontend with mock data (backend optional)
cd frontend
npm run dev
```

Frontend works offline with mock data if backend is unavailable.

### Working on Backend Only

```bash
# Start backend services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access Swagger UI
open http://localhost:8080/swagger-ui.html
```

### Full-Stack Development

```bash
# Terminal 1: Backend
docker-compose up -d

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 🗄️ Database

PostgreSQL runs in Docker:

```bash
# Access database
docker exec -it devhunter-postgres psql -U devhunter -d devhunter

# View tables
\dt

# Check migrations
SELECT * FROM flyway_schema_history;
```

## 🧹 Cleanup

```bash
# Clean all build artifacts
npm run clean

# Stop and remove all Docker containers
docker-compose down -v

# Remove all dependencies (fresh start)
rm -rf frontend/node_modules backend/target
npm run install:all
```

## 🚢 Deployment

### Frontend

```bash
cd frontend
npm run build

# Output: frontend/dist/
# Deploy to: Netlify, Vercel, S3, CDN, etc.
```

### Backend

```bash
# Build Docker image
docker build -t devhunter-backend ./backend

# Or build with Maven
cd backend
mvn clean package

# Output: backend/target/ingest-service-1.0.0-SNAPSHOT.jar
```

## 🤝 Contributing

1. Frontend changes: Work in `frontend/` directory
2. Backend changes: Work in `backend/` directory
3. Keep dependencies isolated
4. Update relevant README files
5. Test both packages before committing

## 📊 Project Status

### Completed Features

✅ Frontend-Backend Integration  
✅ Dexie Local Storage  
✅ Dashboard with Stats  
✅ Search Functionality  
✅ AI Agents (Gemini)  
✅ Multi-cloud Storage  
✅ Full-text Search  
✅ Async Ingest  
✅ Idempotency  
✅ OpenAPI Documentation  

## 📞 Support

- **Issues**: GitHub Issues
- **Docs**: See `/docs` directory
- **API**: http://localhost:8080/swagger-ui.html

---

**Note**: After reorganizing, run `npm install` from the root to set up the workspace structure.

