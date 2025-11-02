# API Testing Guide

## 🧪 Complete API Test Suite

### Prerequisites
```bash
# Start the backend
./start.sh

# Or manually:
docker-compose up -d
```

### 1. Health Check
```bash
curl http://localhost:8080/actuator/health
```

Expected: `{"status":"UP"}`

---

## 📤 Ingest Flow Testing

### 1.1 Start Async Ingest (Success)
```bash
curl -X POST http://localhost:8080/v1/ingest \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -d '{
    "test_id": "integration-test-001",
    "metadata": {
      "name": "Payment Gateway Integration",
      "priority": "high",
      "tags": ["payment", "integration"]
    },
    "artifact": {
      "filename": "test-results.json",
      "content_type": "application/json",
      "size_bytes": 2048
    }
  }'
```

Expected:
- Status: `202 Accepted`
- Header: `Location: /v1/operations/{uuid}`
- Body: Operation with `"status": "PENDING"`

### 1.2 Check Operation Status
```bash
# Replace {operation-id} with the ID from step 1.1
curl http://localhost:8080/v1/operations/{operation-id}
```

Expected:
```json
{
  "id": "...",
  "status": "SUCCEEDED",
  "created_at": "...",
  "updated_at": "...",
  "warnings": [],
  "result": {...}
}
```

### 1.3 Test Idempotency
```bash
# Send the same request twice with same Idempotency-Key
IDEMPOTENCY_KEY="test-idempotent-123"

# First request
curl -X POST http://localhost:8080/v1/ingest \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "test_id": "idempotent-test",
    "artifact": {
      "filename": "test.json",
      "content_type": "application/json",
      "size_bytes": 100
    }
  }' | jq '.id'

# Second request (should return same operation ID)
curl -X POST http://localhost:8080/v1/ingest \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{
    "test_id": "idempotent-test",
    "artifact": {
      "filename": "test.json",
      "content_type": "application/json",
      "size_bytes": 100
    }
  }' | jq '.id'
```

Expected: Both requests return the **same** operation ID

---

## 🗄️ Storage Provider Testing

### 2.1 Request Presigned Upload URL
```bash
curl -X POST http://localhost:8080/v1/artifacts/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test-artifact.zip",
    "content_type": "application/zip",
    "size_bytes": 102400
  }' | jq
```

Expected:
```json
{
  "provider": "azure",
  "upload_url": "https://...",
  "fields": {...},
  "expires_in_seconds": 3600,
  "presigned_id": "..."
}
```

### 2.2 Upload to Presigned URL
```bash
# Create test file
echo "test artifact content" > test-artifact.zip

# Upload (replace URL from step 2.1)
curl -X PUT "{upload_url}" \
  --upload-file test-artifact.zip \
  -H "Content-Type: application/zip"
```

### 2.3 Finalize Upload
```bash
# Calculate SHA256
SHA256=$(shasum -a 256 test-artifact.zip | awk '{print $1}')
SIZE=$(wc -c < test-artifact.zip | tr -d ' ')

curl -X POST http://localhost:8080/v1/artifacts/finalize \
  -H "Content-Type: application/json" \
  -d "{
    \"presigned_id\": \"{presigned_id}\",
    \"size_bytes\": $SIZE,
    \"sha256\": \"$SHA256\"
  }" | jq
```

Expected: Artifact URL with verified checksum

---

## 🔍 Search Testing

### 3.1 Create Test Data
```bash
# Create multiple tests for search
for i in {1..5}; do
  curl -X POST http://localhost:8080/v1/ingest \
    -H "Content-Type: application/json" \
    -d "{
      \"test_id\": \"search-test-$i\",
      \"metadata\": {
        \"name\": \"Test $i Integration Suite\",
        \"type\": \"integration\"
      },
      \"artifact\": {
        \"filename\": \"results-$i.json\",
        \"content_type\": \"application/json\",
        \"size_bytes\": 1024
      }
    }"
  sleep 1
done
```

### 3.2 Full-Text Search
```bash
# Search for "integration"
curl "http://localhost:8080/v1/search?q=integration&limit=10&offset=0" | jq

# Search for specific test
curl "http://localhost:8080/v1/search?q=Test%201&limit=5&offset=0" | jq
```

Expected:
```json
{
  "total": 5,
  "items": [
    {
      "id": "...",
      "type": "test",
      "score": 1.0,
      "snippet": "Test 1 Integration Suite"
    }
  ]
}
```

---

## 📝 CRUD with ETag Testing

### 4.1 List All Tests
```bash
curl http://localhost:8080/v1/tests | jq
```

### 4.2 Get Test with ETag
```bash
# Get a test (replace {test-id})
curl -i http://localhost:8080/v1/tests/{test-id}
```

Expected header: `ETag: "1"`

### 4.3 Update with Valid ETag
```bash
TEST_ID="{test-id}"
ETAG="\"1\""

curl -X PUT http://localhost:8080/v1/tests/$TEST_ID \
  -H "Content-Type: application/json" \
  -H "If-Match: $ETAG" \
  -d '{
    "external_id": "updated-test",
    "name": "Updated Test Name",
    "metadata": {"updated": true}
  }' | jq
```

Expected: `200 OK` with new ETag

### 4.4 Update with Stale ETag (Failure Test)
```bash
curl -X PUT http://localhost:8080/v1/tests/$TEST_ID \
  -H "Content-Type: application/json" \
  -H "If-Match: \"1\"" \
  -d '{
    "name": "Another Update"
  }'
```

Expected: `412 Precondition Failed` with Problem+JSON:
```json
{
  "type": "https://api.example.com/probs/stale-resource",
  "title": "Precondition Failed",
  "status": 412,
  "detail": "Resource has been modified..."
}
```

---

## ❌ Error Handling Tests

### 5.1 Validation Error (400)
```bash
curl -X POST http://localhost:8080/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "test_id": "",
    "artifact": {}
  }'
```

Expected: `400 Bad Request` with Problem+JSON

### 5.2 Payload Too Large (413)
```bash
curl -X POST http://localhost:8080/v1/artifacts/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "huge-file.zip",
    "content_type": "application/zip",
    "size_bytes": 999999999999
  }'
```

Expected: `413 Payload Too Large`

### 5.3 Unsupported Media Type (415)
```bash
curl -X POST http://localhost:8080/v1/artifacts/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test.exe",
    "content_type": "application/x-executable",
    "size_bytes": 1024
  }'
```

Expected: `415 Unsupported Media Type`

### 5.4 Not Found (404)
```bash
curl http://localhost:8080/v1/tests/00000000-0000-0000-0000-000000000000
```

Expected: `404 Not Found`

---

## 🎥 MP4 Feature Flag Test

### 6.1 MP4 Upload (Disabled by Default)
```bash
curl -X POST http://localhost:8080/v1/artifacts/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "recording.mp4",
    "content_type": "video/mp4",
    "size_bytes": 10485760
  }'
```

Expected: `400 Bad Request` - "MP4 uploads are not enabled"

### 6.2 Enable MP4 Feature Flag
```bash
# Edit backend/.env
echo "FEATURE_FLAG_ENABLE_MP4_UPLOADS=true" >> backend/.env

# Restart backend
docker-compose restart backend

# Wait for startup
sleep 10

# Try again
curl -X POST http://localhost:8080/v1/artifacts/presign \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "recording.mp4",
    "content_type": "video/mp4",
    "size_bytes": 10485760
  }' | jq
```

Expected: `200 OK` with presigned URL

---

## 🧪 Automated Test Script

```bash
#!/bin/bash
# save as test-api.sh

API_BASE="http://localhost:8080/v1"

echo "🧪 Running API Test Suite..."

# Test 1: Health Check
echo "1️⃣  Testing health check..."
curl -sf $API_BASE/../actuator/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"

# Test 2: Ingest
echo "2️⃣  Testing ingest..."
OPERATION_ID=$(curl -sf -X POST $API_BASE/ingest \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -d '{
    "test_id": "auto-test-001",
    "artifact": {
      "filename": "test.json",
      "content_type": "application/json",
      "size_bytes": 100
    }
  }' | jq -r '.id')

[ -n "$OPERATION_ID" ] && echo "✅ Ingest passed: $OPERATION_ID" || echo "❌ Ingest failed"

# Test 3: Operation Status
echo "3️⃣  Testing operation status..."
curl -sf $API_BASE/operations/$OPERATION_ID > /dev/null && echo "✅ Operation status passed" || echo "❌ Operation status failed"

# Test 4: Search
echo "4️⃣  Testing search..."
curl -sf "$API_BASE/search?q=test&limit=10" > /dev/null && echo "✅ Search passed" || echo "❌ Search failed"

# Test 5: Validation Error
echo "5️⃣  Testing validation..."
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" -X POST $API_BASE/ingest \
  -H "Content-Type: application/json" \
  -d '{"test_id":"","artifact":{}}')

[ "$HTTP_CODE" = "400" ] && echo "✅ Validation error handled" || echo "❌ Validation error failed"

echo ""
echo "✨ Test suite complete!"
```

Save and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📊 Load Testing (Optional)

Using Apache Bench:
```bash
# Install Apache Bench (if needed)
# macOS: brew install apache-bench
# Linux: apt-get install apache2-utils

# Test ingest endpoint
ab -n 100 -c 10 \
  -T "application/json" \
  -p ingest-payload.json \
  http://localhost:8080/v1/ingest
```

---

## 🔍 Swagger UI Interactive Testing

Open: http://localhost:8080/swagger-ui.html

- Try out all endpoints interactively
- See request/response schemas
- Test authentication (Phase-2)
- Export OpenAPI spec

---

## 📝 Notes

- All timestamps are in ISO-8601 format (UTC)
- UUIDs are version 4 (random)
- Problem+JSON follows RFC 7807
- ETags use optimistic locking
- Idempotency keys are valid for 24 hours

