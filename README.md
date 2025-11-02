# Dev Hunter - AI-Powered Test Management Platform

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🏗️ Architecture

This is a full-stack application with:

- **Frontend**: React + TypeScript + Vite with AI Studio integration
- **Backend**: Java Spring Boot REST API with PostgreSQL
- **Storage**: Multi-cloud support (Azure/AWS/GCS)
- **Database**: PostgreSQL 15+ with full-text search

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your storage provider credentials

# 2. Start all services (PostgreSQL + Backend)
docker-compose up -d

# 3. Start frontend (separate terminal)
npm install
npm run dev

# 4. Access applications
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### Option 2: Local Development

**Backend Setup:**

```bash
# Start PostgreSQL
docker run -d \
  --name devhunter-postgres \
  -e POSTGRES_DB=devhunter \
  -e POSTGRES_USER=devhunter \
  -e POSTGRES_PASSWORD=devhunter \
  -p 5432:5432 \
  postgres:15-alpine

# Start backend
cd backend
cp .env.example .env
# Edit .env with your configuration
mvn spring-boot:run
```

**Frontend Setup:**

```bash
# Install dependencies
npm install

# Set Gemini API key
echo "VITE_GEMINI_API_KEY=your-api-key" > .env.local

# Run frontend
npm run dev
```

## 📚 Documentation

- **[Backend README](backend/README.md)** - Complete API documentation
- **[OpenAPI Spec](docs/openapi.yaml)** - API specification
- **[Database Migrations](backend/src/main/resources/db/migration/)** - SQL schemas

## 🎯 Features

### ✅ EPIC 1 — API Spec & Guardrails
- Complete OpenAPI 3.0 specification
- Swagger UI for interactive API testing
- Problem+JSON error responses (RFC 7807)
- Size limits: 200MB default, 500MB for MP4 (feature flag)
- MIME type validation

### ✅ EPIC 2 — Database & Search
- PostgreSQL with Flyway migrations
- Full-text search using `tsvector` + GIN indexes
- Testcontainers integration tests
- Search ranking with `ts_rank`

### ✅ EPIC 3 — Async Ingest & Idempotency
- Async operations with status tracking (PENDING/RUNNING/SUCCEEDED/FAILED)
- In-database queue worker
- Idempotency via `Idempotency-Key` header (24h TTL)
- Warning aggregation (e.g., VERSION_CONFLICT)

### ✅ EPIC 4 — Multi-Cloud Storage Providers
- Pluggable storage provider abstraction
- Azure Blob Storage with SAS tokens (default)
- AWS S3 with SigV4 presigning
- Google Cloud Storage with V4 signed URLs
- Upload finalization with SHA256 + size verification

### ✅ EPIC 5 — Backend Controllers & Services
- REST endpoints: `/v1/ingest`, `/v1/operations`, `/v1/search`, `/v1/artifacts`, `/v1/tests`
- ETag support with optimistic locking (returns 412 on stale updates)
- CORS configuration
- Request validation

## 🔌 API Endpoints

### Ingest Flow
```bash
POST /v1/ingest
GET  /v1/operations/{id}
```

### Storage Flow
```bash
POST /v1/artifacts/presign
POST /v1/artifacts/finalize
```

### Search
```bash
GET  /v1/search?q={query}&limit=20&offset=0
```

### CRUD
```bash
GET    /v1/tests
GET    /v1/tests/{id}
PUT    /v1/tests/{id}
DELETE /v1/tests/{id}
```

## 🧪 Testing

```bash
# Backend integration tests (with Testcontainers)
cd backend
mvn test

# Frontend development
npm run dev

# Build frontend for production
npm run build
```

## 📊 Tech Stack

**Frontend:**
- React 19
- TypeScript
- Vite
- Google Gemini AI
- React Markdown

**Backend:**
- Java 21
- Spring Boot 3.2
- PostgreSQL 15
- Flyway (migrations)
- Azure Storage / AWS S3 / Google Cloud Storage
- Testcontainers (testing)

## 🔒 Security Features

- Idempotency keys for duplicate prevention
- Optimistic locking with ETags
- Size and MIME type validation
- Problem+JSON error responses
- CORS configuration
- Phase-2 auth placeholders (documented, not enforced)

## 🗄️ Database Schema

Core tables:
- `tests` - Test definitions with full-text search
- `runs` - Test execution runs
- `artifacts` - Uploaded files/results
- `operations` - Async operation tracking
- `idempotency` - Request deduplication (24h TTL)

## 🛠️ Configuration

**Backend** (`backend/.env`):
```bash
DATABASE_URL=jdbc:postgresql://localhost:5432/devhunter
STORAGE_PROVIDER=azure  # or aws, gcs
AZURE_STORAGE_CONNECTION_STRING=...
FEATURE_FLAG_ENABLE_MP4_UPLOADS=false
```

**Frontend** (`.env.local`):
```bash
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_API_BASE_URL=http://localhost:8080/v1
```

## 📖 Project Structure

```
.
├── backend/                    # Java Spring Boot API
│   ├── src/main/java/
│   │   └── com/devhunter/ingest/
│   │       ├── controller/     # REST endpoints
│   │       ├── service/        # Business logic
│   │       ├── repository/     # Database access
│   │       ├── domain/         # JPA entities
│   │       └── storage/        # Multi-cloud providers
│   ├── src/main/resources/
│   │   └── db/migration/       # Flyway SQL migrations
│   └── src/test/               # Integration tests
├── components/                 # React components
├── services/                   # Frontend services
├── docs/                       # OpenAPI specification
├── docker-compose.yml          # Container orchestration
└── package.json               # Frontend dependencies
```

## 🌐 Frontend Connection

Update your frontend to connect to the backend:

```typescript
// In your service files
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/v1';

// Example: Start ingest
const response = await fetch(`${API_BASE_URL}/ingest`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID()
  },
  body: JSON.stringify(ingestRequest)
});

const operation = await response.json();
const locationHeader = response.headers.get('Location');
```

## 📈 Monitoring

Spring Boot Actuator endpoints:
- `GET /actuator/health` - Health check
- `GET /actuator/metrics` - Application metrics
- `GET /actuator/info` - Build information

## 🤝 Contributing

1. Check the OpenAPI spec for API contracts
2. Run integration tests before committing
3. Follow the existing code structure
4. Update documentation for new features

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check logs
docker-compose logs backend
```

**Frontend can't connect to backend:**
```bash
# Verify CORS settings in backend/src/main/resources/application.yml
# Check VITE_API_BASE_URL in .env.local
```

**Tests fail:**
```bash
# Ensure Docker is running (required for Testcontainers)
docker info
```

## 📝 License

Proprietary - Dev Hunter Inc.

---

**View your app in AI Studio:** https://ai.studio/apps/drive/1dn8I1T7G7MF68jqzdyj4n6wOCdlzOoRr
