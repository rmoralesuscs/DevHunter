#!/bin/bash
# Health check script for Dev Hunter services

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 Dev Hunter System Health Check"
echo "=================================="
echo ""

# Check Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Installed${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check PostgreSQL container
echo -n "PostgreSQL: "
if docker ps | grep -q devhunter-postgres; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

# Check Backend
echo -n "Backend: "
if curl -sf http://localhost:8080/actuator/health > /dev/null 2>&1; then
    STATUS=$(curl -sf http://localhost:8080/actuator/health | jq -r '.status' 2>/dev/null || echo "UNKNOWN")
    if [ "$STATUS" = "UP" ]; then
        echo -e "${GREEN}✓ Healthy${NC}"
    else
        echo -e "${YELLOW}⚠ Status: $STATUS${NC}"
    fi
else
    echo -e "${RED}✗ Not responding${NC}"
fi

# Check Swagger UI
echo -n "Swagger UI: "
if curl -sf http://localhost:8080/swagger-ui.html > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Available${NC}"
else
    echo -e "${RED}✗ Not available${NC}"
fi

# Check Database connection
echo -n "Database: "
if curl -sf http://localhost:8080/actuator/health 2>/dev/null | grep -q "UP"; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Not connected${NC}"
fi

# Check API endpoints
echo ""
echo "API Endpoints:"
echo -n "  GET /v1/tests: "
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:8080/v1/tests 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ 200 OK${NC}"
else
    echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
fi

echo -n "  GET /v1/search: "
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "http://localhost:8080/v1/search?q=test" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ 200 OK${NC}"
else
    echo -e "${RED}✗ HTTP $HTTP_CODE${NC}"
fi

# Check storage configuration
echo ""
echo "Configuration:"
echo -n "  Storage Provider: "
if [ -f backend/.env ]; then
    PROVIDER=$(grep "^STORAGE_PROVIDER=" backend/.env | cut -d'=' -f2 || echo "not set")
    echo -e "${YELLOW}$PROVIDER${NC}"
else
    echo -e "${RED}backend/.env not found${NC}"
fi

echo -n "  MP4 Uploads: "
if [ -f backend/.env ]; then
    MP4_ENABLED=$(grep "^FEATURE_FLAG_ENABLE_MP4_UPLOADS=" backend/.env | cut -d'=' -f2 || echo "false")
    echo -e "${YELLOW}$MP4_ENABLED${NC}"
else
    echo -e "${RED}not configured${NC}"
fi

echo ""
echo "=================================="
echo "Health Check Complete"

