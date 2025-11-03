# Frontend-Backend Integration Guide

## Overview

The Dev Hunter frontend is now configured to connect to the Spring Boot backend API. The frontend will attempt to connect to the backend and fall back to mock data if the backend is unavailable.

## Quick Start

### 1. Start the Backend

 bash
# Option A: Using Docker Compose (Recommended)
docker-compose up -d

# Option B: Local Development
cd backend
mvn spring-boot:run
 

Backend will be available at: `http://localhost:8080`

### 2. Configure Frontend Environment

Create or update `.env.local`:

 bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8080/v1

# Optional: Gemini API Key (will prompt in browser if not set)
VITE_GEMINI_API_KEY=your-gemini-api-key
 

### 3. Start the Frontend

 bash
npm install
npm run dev
 

Frontend will be available at: `http://localhost:5173` (or the port shown by Vite)

## Connection Status

The Dashboard displays a connection indicator in the top-right corner:

- 🟢 **Backend Connected** - Successfully connected to the backend API
- 🟡 **Offline Mode** - Using mock data (backend unavailable)

## API Integration Details

### Endpoints Used

The frontend connects to these backend endpoints:

- `GET /v1/tests` - Fetch all test runs
- `GET /v1/search?q={query}` - Full-text search
- `GET /v1/tests/{id}` - Get single test
- `POST /v1/tests` - Create new test
- `PUT /v1/tests/{id}` - Update test (with ETag support)
- `DELETE /v1/tests/{id}` - Delete test
- `POST /v1/ingest` - Start async ingest operation
- `GET /v1/operations/{id}` - Check operation status
- `POST /v1/artifacts/presign` - Request presigned upload URL
- `POST /v1/artifacts/finalize` - Finalize artifact upload

### API Service Layer

The frontend includes a comprehensive API service (`services/apiService.ts`) that handles:

- **Error Handling**: Catches and formats Problem+JSON error responses (RFC 7807)
- **Idempotency**: Automatically adds `Idempotency-Key` headers for critical operations
- **ETag Support**: Supports optimistic locking for updates
- **Fallback**: Gracefully falls back to mock data if backend is unavailable

### Example Usage

 typescript
import { testsApi, searchApi } from '../services/apiService';

// Fetch tests
const response = await testsApi.getTests({ limit: 100 });
console.log(response.data);

// Search
const results = await searchApi.search('integration test', { limit: 20 });
console.log(results.data);

// Create test
const newTest = await testsApi.createTest({
  name: 'My Test',
  status: Status.Queued,
  // ... other fields
});

// Update with ETag
const updated = await testsApi.updateTest(
  testId,
  { name: 'Updated Name' },
  '"1"' // ETag from previous GET
);
 

## Features

### ✅ Automatic Fallback
- Frontend works offline with mock data
- Seamlessly switches to backend when available
- No configuration required

### ✅ Real-time Search
- Debounced search queries (300ms)
- Full-text search via backend `/search` endpoint
- Falls back to client-side filtering if backend unavailable

### ✅ Optimistic UI
- Shows data immediately from local state
- Syncs with backend in background
- Loading indicators for async operations

### ✅ Error Handling
- Problem+JSON error formatting
- User-friendly error messages
- Console logging for debugging

## Backend Requirements

The backend must be running and accessible for full functionality. The frontend expects:

1. **Backend URL**: `http://localhost:8080` (configurable via `VITE_API_BASE_URL`)
2. **API Version**: `/v1` endpoints
3. **CORS**: Backend must allow requests from frontend origin
4. **PostgreSQL**: Backend requires PostgreSQL database

## Troubleshooting

### "Offline Mode" displayed

**Cause**: Frontend cannot connect to backend

**Solutions**:
1. Verify backend is running: `curl http://localhost:8080/actuator/health`
2. Check CORS configuration in backend
3. Verify `VITE_API_BASE_URL` in `.env.local`
4. Check browser console for detailed error messages

### Backend connection errors

**Check backend logs**:
 bash
docker-compose logs backend
 

**Check PostgreSQL**:
 bash
docker-compose logs postgres
 

**Verify API endpoints**:
 bash
# Health check
curl http://localhost:8080/actuator/health

# API endpoints
curl http://localhost:8080/v1/tests

# OpenAPI spec
curl http://localhost:8080/api-docs
 

### CORS Issues

If you see CORS errors in the browser console, verify backend CORS configuration in `application.yml`:

 yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:5173,http://localhost:3000"
      allowed-methods: "*"
      allowed-headers: "*"
 

## Development Workflow

### With Backend

1. Start backend: `docker-compose up -d`
2. Start frontend: `npm run dev`
3. Make changes to frontend
4. Hot reload automatically updates browser
5. Backend changes require restart: `docker-compose restart backend`

### Without Backend (Mock Data)

1. Start frontend only: `npm run dev`
2. Frontend uses mock data automatically
3. All UI features work with mock data
4. Connect to backend later without code changes

## Production Deployment

### Environment Variables

For production, set these environment variables:

 bash
VITE_API_BASE_URL=https://api.yourproduction.com/v1
VITE_GEMINI_API_KEY=your-production-gemini-key
 

### Build

 bash
npm run build
 

Output will be in `dist/` directory.

### CORS Configuration

Ensure production backend allows requests from production frontend domain:

 yaml
spring:
  web:
    cors:
      allowed-origins: "https://yourproduction.com"
 

## Testing

### Frontend Unit Tests
 bash
npm test
 

### Backend Integration Tests
 bash
cd backend
mvn test
 

### Manual Integration Testing

1. Start both frontend and backend
2. Verify connection status shows "Backend Connected"
3. Test search functionality
4. Test creating/updating/deleting tests
5. Check browser console for errors

## Additional Resources

- [Backend README](backend/README.md) - Complete backend documentation
- [OpenAPI Spec](docs/openapi.yaml) - API specification
- [Swagger UI](http://localhost:8080/swagger-ui.html) - Interactive API docs

