# Dev Hunter Backend Service

A comprehensive Java Spring Boot service implementing async ingest, full-text search, and multi-cloud storage with PostgreSQL.

## 📋 Features (All 5 EPICs Implemented)

### EPIC 1 — API Spec & Guardrails ✅
- Complete OpenAPI 3.0 spec at `/docs/openapi.yaml`
- Swagger UI available at `http://localhost:8080/swagger-ui.html`
- Problem+JSON error responses (RFC 7807)
- Size limits: 200MB default, 500MB for MP4 (feature flag)
- Allowed MIME types enforced
- Phase-2 auth placeholders (not enforced)

### EPIC 2 — Database & Search ✅
- Flyway migrations for PostgreSQL
- Full-text search with `tsvector` and GIN indexes
- Testcontainers integration tests
- Search ranking with `ts_rank`

### EPIC 3 — Async Ingest & Idempotency ✅
- Operations table with PENDING/RUNNING/SUCCEEDED/FAILED states
- In-DB queue worker (scheduled processor)
- Idempotency via `Idempotency-Key` header (24h TTL)
- Warning aggregation (e.g., VERSION_CONFLICT)

### EPIC 4 — Multi-Cloud Storage Providers ✅
- `StorageProvider` abstraction
- Azure Blob Storage with SAS tokens (default)
- AWS S3 with SigV4 presigning
- Google Cloud Storage with V4 signed URLs
- Presign/finalize flow with SHA256 + size verification

### EPIC 5 — Backend Controllers & Services ✅
- REST controllers: `/v1/ingest`, `/v1/operations`, `/v1/search`, `/v1/artifacts`, `/v1/tests`
- Problem+JSON error handling
- ETag support with optimistic locking (412 on stale)
- CORS configuration
- Request validation with `@Valid`

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL 15+ (or use Docker Compose)
- Azure/AWS/GCS credentials (depending on chosen provider)

### Using Docker Compose (Recommended)

1. **Configure environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your storage credentials
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Access Swagger UI:**
   ```
   http://localhost:8080/swagger-ui.html
   ```

### Local Development

1. **Start PostgreSQL:**
   ```bash
   docker run -d \
     --name devhunter-postgres \
     -e POSTGRES_DB=devhunter \
     -e POSTGRES_USER=devhunter \
     -e POSTGRES_PASSWORD=devhunter \
     -p 5432:5432 \
     postgres:15-alpine
   ```

2. **Configure application:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run application:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

4. **Run tests:**
   ```bash
   mvn test
   ```

## 📖 API Endpoints

### Ingest Flow
```bash
# 1. Start async ingest
curl -X POST http://localhost:8080/v1/ingest \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: unique-request-123" \
  -d '{
    "test_id": "test-123",
    "metadata": {"name": "Integration Test"},
    "artifact": {
      "filename": "results.json",
      "content_type": "application/json",
      "size_bytes": 1024
    }
  }'

# Response: 202 Accepted
# Location: /v1/operations/{operation_id}

# 2. Check operation status
curl http://localhost:8080/v1/operations/{operation_id}
```

### Storage Flow
```bash
# 1. Request presigned URL
curl -X POST http://localhost:8080/v1/artifacts/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "artifact.zip",
    "content_type": "application/zip",
    "size_bytes": 102400
  }'

# Response includes: upload_url, provider, presigned_id

# 2. Upload to presigned URL (using curl/client)
curl -X PUT "{upload_url}" \
  --upload-file artifact.zip \
  -H "Content-Type: application/zip"

# 3. Finalize upload
curl -X POST http://localhost:8080/v1/artifacts/finalize \
  -H "Content-Type: application/json" \
  -d '{
    "presigned_id": "{presigned_id}",
    "size_bytes": 102400,
    "sha256": "{sha256_hash}"
  }'
```

### Search
```bash
# Full-text search
curl "http://localhost:8080/v1/search?q=integration&limit=20&offset=0"
```

### CRUD with ETag
```bash
# Get with ETag
curl -i http://localhost:8080/v1/tests/{test_id}
# Returns: ETag: "1"

# Update with ETag (412 on stale)
curl -X PUT http://localhost:8080/v1/tests/{test_id} \
  -H "If-Match: \"1\"" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test"}'
```

## 🗄️ Database Schema

Flyway migrations handle:
- Core tables: `tests`, `runs`, `artifacts`, `operations`, `idempotency`
- Full-text search: `tsvector` columns + GIN indexes
- Triggers: `updated_at` auto-update, `document_tsv` maintenance
- Extensions: `pg_trgm` for trigram similarity

## 🧪 Testing

### Integration Tests (Testcontainers)
```bash
mvn test
```

Tests include:
- `IngestIntegrationTest`: Async ingest flow, idempotency, validation
- `SearchIntegrationTest`: Full-text search, ranking, index verification

### Manual Testing
```bash
# Health check
curl http://localhost:8080/actuator/health

# OpenAPI spec
curl http://localhost:8080/api-docs

# Swagger UI
open http://localhost:8080/swagger-ui.html
```

## 🔒 Security & Guardrails

- **Size limits:** 200MB default, 500MB for MP4 (feature flag)
- **MIME validation:** Whitelist enforcement
- **Idempotency:** 24-hour deduplication
- **Optimistic locking:** ETag/version-based concurrency control
- **Problem+JSON:** Standardized error responses
- **CORS:** Configurable origins
- **Phase-2 auth:** Placeholders in OpenAPI (not enforced)

## ⚙️ Configuration

Key environment variables:

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/devhunter

# Storage provider (azure|aws|gcs)
STORAGE_PROVIDER=azure

# Azure
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_CONTAINER_NAME=devhunter-artifacts

# AWS
AWS_REGION=us-east-1
AWS_BUCKET_NAME=devhunter-artifacts

# GCS
GCS_PROJECT_ID=your-project
GCS_BUCKET_NAME=devhunter-artifacts

# Feature flags
FEATURE_FLAG_ENABLE_MP4_UPLOADS=false
```

## 📦 Project Structure

```
backend/
├── src/main/java/com/devhunter/ingest/
│   ├── config/           # CORS, async config
│   ├── controller/       # REST endpoints
│   ├── domain/           # JPA entities
│   ├── dto/              # Request/response objects
│   ├── exception/        # Problem+JSON handlers
│   ├── repository/       # JPA repositories
│   ├── service/          # Business logic
│   └── storage/          # Multi-cloud providers
├── src/main/resources/
│   ├── db/migration/     # Flyway SQL scripts
│   └── application.yml   # Configuration
└── src/test/java/        # Integration tests
```

## 🔄 Frontend Integration

Frontend can connect by:

1. Update frontend API base URL to `http://localhost:8080/v1`
2. Use OpenAPI spec for type generation
3. Handle Problem+JSON errors
4. Include `Idempotency-Key` for critical operations
5. Support ETag for updates

Example TypeScript fetch:
```typescript
const response = await fetch('http://localhost:8080/v1/ingest', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': generateUUID()
  },
  body: JSON.stringify(ingestRequest)
});

if (response.status === 202) {
  const operation = await response.json();
  const location = response.headers.get('Location');
  // Poll location for status
}
```

## 📊 Monitoring

Actuator endpoints:
- `/actuator/health` - Health status
- `/actuator/metrics` - Metrics
- `/actuator/info` - Application info

## 🐛 Troubleshooting

**Database connection fails:**
```bash
# Check PostgreSQL is running
docker ps | grep postgres
# Check connection
psql -h localhost -U devhunter -d devhunter
```

**Storage provider errors:**
```bash
# Verify credentials in .env
# Check provider is set correctly
echo $STORAGE_PROVIDER
```

**Tests fail:**
```bash
# Ensure Docker is running (Testcontainers)
docker info
```

## 📝 License

Proprietary - Dev Hunter Inc.

