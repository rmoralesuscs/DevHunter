# Dev Hunter - Monorepo Structure Guide

## Overview

Dev Hunter uses a **monorepo architecture** where both frontend (React/TypeScript) and backend (Java/Spring Boot) live in the same repository but remain independent modules.

## Directory Structure

```
dev-hunter-01/                          # Project Root
│
├── 📁 Frontend (Root Level)            # React/TypeScript/Vite Application
│   ├── App.tsx                         # Main React component
│   ├── index.tsx                       # React entry point
│   ├── index.html                      # HTML template
│   ├── index.css                       # Global styles
│   ├── vite.config.ts                  # Vite build configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tailwind.config.js              # Tailwind CSS configuration
│   ├── package.json                    # Node dependencies + scripts
│   ├── package-lock.json               # Locked dependency versions
│   │
│   ├── 📁 components/                  # React components
│   │   ├── Dashboard.tsx
│   │   ├── RunsTable.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AIAgents.tsx
│   │   └── RunDetailModal.tsx
│   │
│   ├── 📁 services/                    # Frontend services
│   │   ├── apiService.ts               # Backend API client
│   │   ├── geminiService.ts            # Google Gemini AI integration
│   │   └── db.ts                       # Dexie (IndexedDB) local storage
│   │
│   ├── 📁 utils/                       # Utility functions
│   │   └── helpers.ts
│   │
│   ├── types.ts                        # TypeScript type definitions
│   ├── constants.tsx                   # Constants and mock data
│   └── .env.local                      # Frontend environment variables
│
├── 📁 backend/                         # Java/Spring Boot Backend Module
│   ├── 📁 src/
│   │   ├── 📁 main/
│   │   │   ├── 📁 java/com/devhunter/ingest/
│   │   │   │   ├── 📁 config/          # Spring configuration
│   │   │   │   ├── 📁 controller/      # REST controllers
│   │   │   │   ├── 📁 domain/          # JPA entities
│   │   │   │   ├── 📁 dto/             # Data Transfer Objects
│   │   │   │   ├── 📁 exception/       # Exception handlers
│   │   │   │   ├── 📁 repository/      # JPA repositories
│   │   │   │   ├── 📁 service/         # Business logic
│   │   │   │   ├── 📁 storage/         # Multi-cloud storage
│   │   │   │   └── DevHunterIngestApplication.java
│   │   │   │
│   │   │   └── 📁 resources/
│   │   │       ├── application.yml     # Spring Boot configuration
│   │   │       └── 📁 db/migration/    # Flyway SQL migrations
│   │   │
│   │   └── 📁 test/                    # Integration tests
│   │
│   ├── pom.xml                         # Maven dependencies
│   ├── Dockerfile                      # Backend container image
│   ├── .env                            # Backend environment variables
│   └── README.md                       # Backend-specific docs
│
├── 📁 docs/                            # Project documentation
│   └── openapi.yaml                    # API specification
│
├── docker-compose.yml                  # Orchestrates PostgreSQL + Backend
├── README.md                           # Main project documentation
├── QUICKSTART.md                       # Quick start guide
├── STARTUP-CHECKLIST.md                # Step-by-step startup
├── FRONTEND_BACKEND_INTEGRATION.md     # Integration guide
├── .gitignore                          # Git ignore rules
└── start-backend.sh                    # Helper script to start backend
```

## Module Responsibilities

### Frontend Module (Root Level)
- **Language**: TypeScript/JavaScript
- **Framework**: React 19 + Vite
- **Build Tool**: Vite
- **Package Manager**: npm
- **Port**: 5173 (development)
- **Purpose**: User interface, AI integration, offline-first features

### Backend Module (`backend/`)
- **Language**: Java 21
- **Framework**: Spring Boot 3.2
- **Build Tool**: Maven
- **Package Manager**: Maven Central
- **Port**: 8080
- **Purpose**: REST API, database, storage, business logic

## Separation of Concerns

### Independent Build Systems
```bash
# Frontend
npm install          # Install Node dependencies
npm run dev          # Start Vite dev server
npm run build        # Build for production

# Backend
cd backend
mvn clean install    # Build with Maven
mvn spring-boot:run  # Run Spring Boot app
```

### Independent Dependencies
- **Frontend**: `package.json` manages Node.js dependencies
- **Backend**: `pom.xml` manages Maven/Java dependencies
- **No Conflicts**: Each module has its own dependency tree

### Shared Resources
- **docker-compose.yml**: Orchestrates backend + PostgreSQL
- **Documentation**: README files at root and backend/
- **.env files**: Separate for frontend (`.env.local`) and backend (`backend/.env`)

## Development Workflow

### Working on Frontend Only
```bash
# From project root
npm install
npm run dev

# Frontend runs with mock data if backend unavailable
# Access: http://localhost:5173
```

### Working on Backend Only
```bash
# Option 1: Docker Compose (recommended)
docker-compose up -d

# Option 2: Local Maven
cd backend
mvn spring-boot:run

# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Working on Full Stack
```bash
# Terminal 1: Start backend
docker-compose up -d

# Terminal 2: Start frontend
npm run dev

# Frontend: http://localhost:5173 (with backend integration)
```

## Build Commands Reference

### Monorepo-Level Commands
```bash
# From project root
npm run dev              # Start frontend dev server
npm run build            # Build frontend for production
npm run dev:frontend     # Alias for frontend dev
npm run build:frontend   # Alias for frontend build
npm run dev:backend      # Start backend with Maven
npm run build:backend    # Build backend with Maven
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run start            # Start everything (Docker + frontend)
```

### Module-Specific Commands
```bash
# Frontend (from root)
npm install              # Install frontend dependencies
vite                     # Start Vite directly
vite build               # Build directly

# Backend (from backend/)
cd backend
mvn clean install        # Full build
mvn test                 # Run tests only
mvn spring-boot:run      # Run application
```

## IDE Configuration

### WebStorm / IntelliJ IDEA
WebStorm handles this monorepo structure automatically:
- **JavaScript/TypeScript**: Uses `tsconfig.json` at root
- **Java**: Uses `pom.xml` in `backend/` directory
- **Both work simultaneously** without conflicts

### VS Code
Add to `.vscode/settings.json`:
```json
{
  "java.project.sourcePaths": ["backend/src/main/java"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.exclude": {
    "**/node_modules": true,
    "backend/target": true
  }
}
```

## Docker Integration

### docker-compose.yml Structure
```yaml
services:
  postgres:        # Database for backend
    ...
  backend:         # Java Spring Boot service
    build: ./backend
    ...
```

**Frontend is NOT in Docker Compose** because:
- Vite dev server runs natively with hot-reload
- Frontend is a static build deployed separately in production
- Docker Compose handles backend infrastructure only

## Deployment Strategy

### Development
- Frontend: `npm run dev` (hot reload)
- Backend: Docker Compose or Maven

### Production
- **Frontend**: Build static files (`npm run build`) → Deploy to CDN/static hosting
- **Backend**: Docker image → Deploy to container platform
- **Database**: Managed PostgreSQL service

## Common Questions

### Q: Why is frontend at root instead of `frontend/` directory?
**A**: This is a valid monorepo pattern. The root is the primary deliverable (the UI), and backend is a supporting module. You could reorganize into `frontend/` + `backend/` if preferred, but current structure works fine.

### Q: Can I move frontend into its own directory?
**A**: Yes! To reorganize:
1. Create `frontend/` directory
2. Move all frontend files (except `backend/`, `docker-compose.yml`)
3. Update paths in `vite.config.ts`, `docker-compose.yml`, etc.
4. Update all import statements

However, the current structure is simpler and works well.

### Q: Do they share any code?
**A**: No direct code sharing. They communicate via:
- REST API calls (frontend → backend)
- Shared documentation (READMEs, OpenAPI spec)
- Environment variables

### Q: How do I know which commands to run where?
**A**: 
- **Root directory**: npm commands (frontend)
- **backend/ directory**: mvn commands (backend)
- **docker-compose**: Run from root (orchestrates backend only)

## Best Practices

### ✅ DO
- Keep frontend and backend dependencies separate
- Use `package.json` scripts for common tasks
- Document both modules in README
- Use Docker Compose for backend development
- Keep `.env` files separate (`.env.local` vs `backend/.env`)

### ❌ DON'T
- Mix Java dependencies in `package.json`
- Mix Node dependencies in `pom.xml`
- Run `mvn` commands from root directory
- Run `npm` commands from `backend/` directory

## Summary

This **monorepo structure is valid and recommended** for full-stack applications:
- ✅ Single source of truth
- ✅ Coordinated versioning
- ✅ Simplified CI/CD
- ✅ Shared documentation
- ✅ Independent build systems
- ✅ No module conflicts

The key is understanding which commands belong where and keeping dependencies properly separated.

