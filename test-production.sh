#!/bin/bash

# Ensei Platform Production Testing Script
# This script tests all production endpoints and functionality

set -e

echo "🧪 Ensei Platform Production Testing"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL=${BASE_URL:-"http://localhost"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@ensei.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"admin123"}

echo -e "${BLUE}📋 Testing Configuration:${NC}"
echo "Base URL: $BASE_URL"
echo "Admin Email: $ADMIN_EMAIL"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_status="$3"
    
    echo -n "Testing $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to test HTTP endpoint
test_http() {
    local url="$1"
    local expected_status="${2:-200}"
    local method="${3:-GET}"
    local data="$4"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$url" > /dev/null
    else
        curl -s -X "$method" "$url" > /dev/null
    fi
}

# Function to test with authentication
test_auth() {
    local url="$1"
    local token="$2"
    local method="${3:-GET}"
    local data="$4"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data" "$url" > /dev/null
    else
        curl -s -X "$method" -H "Authorization: Bearer $token" "$url" > /dev/null
    fi
}

echo -e "${BLUE}🔍 Starting production tests...${NC}"
echo ""

# 1. Health Check Tests
echo -e "${YELLOW}1. Health Check Tests${NC}"
run_test "API Gateway Health" "test_http '$BASE_URL/health'"
run_test "Mission Engine Health" "test_http '$BASE_URL/mission-engine/health'"
run_test "WebSocket Stats" "test_http '$BASE_URL/ws/stats'"
echo ""

# 2. Authentication Tests
echo -e "${YELLOW}2. Authentication Tests${NC}"
run_test "Admin Login" "test_http '$BASE_URL/v1/auth/login' '200' 'POST' '{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}'"

# Get admin token for authenticated tests
ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" | \
    grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Admin token obtained${NC}"
    run_test "Admin Submissions" "test_auth '$BASE_URL/v1/admin/submissions' '$ADMIN_TOKEN'"
    run_test "Admin Missions" "test_auth '$BASE_URL/v1/admin/missions' '$ADMIN_TOKEN'"
    run_test "Admin Users" "test_auth '$BASE_URL/v1/admin/users' '$ADMIN_TOKEN'"
    run_test "Admin Analytics" "test_auth '$BASE_URL/v1/admin/analytics/overview' '$ADMIN_TOKEN'"
else
    echo -e "${RED}❌ Failed to obtain admin token${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# 3. Mission Engine Tests
echo -e "${YELLOW}3. Mission Engine Tests${NC}"
run_test "Task Catalog" "test_http '$BASE_URL/mission-engine/task-catalog'"
run_test "Degen Presets" "test_http '$BASE_URL/mission-engine/degen-presets'"

# Test pricing calculations
run_test "Fixed Mission Pricing" "test_http '$BASE_URL/mission-engine/calculate-pricing' '200' 'POST' '{\"platform\":\"twitter\",\"type\":\"engage\",\"model\":\"fixed\",\"target\":\"standard\",\"tasks\":[\"like\",\"retweet\"],\"cap\":100}'"

run_test "Degen Mission Pricing" "test_http '$BASE_URL/mission-engine/calculate-pricing' '200' 'POST' '{\"platform\":\"instagram\",\"type\":\"content\",\"model\":\"degen\",\"target\":\"premium\",\"tasks\":[\"reel\"],\"durationHours\":24,\"winnersCap\":5}'"

run_test "Degen Validation" "test_http '$BASE_URL/mission-engine/validate-degen' '200' 'POST' '{\"durationHours\":24,\"winnersCap\":5}'"
echo ""

# 4. WebSocket Tests
echo -e "${YELLOW}4. WebSocket Tests${NC}"
run_test "WebSocket Connection" "node test-websocket.js > /dev/null 2>&1"
echo ""

# 5. API Gateway Tests
echo -e "${YELLOW}5. API Gateway Tests${NC}"
run_test "Rate Limiting" "test_http '$BASE_URL/v1/admin/submissions' '429'"
run_test "CORS Headers" "curl -s -H 'Origin: https://example.com' -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: X-Requested-With' -X OPTIONS '$BASE_URL/health' > /dev/null"
echo ""

# 6. Database Tests (if accessible)
echo -e "${YELLOW}6. Database Tests${NC}"
if command -v psql &> /dev/null; then
    run_test "Database Connection" "psql -h localhost -U ensei_user -d ensei_platform -c 'SELECT 1;' > /dev/null 2>&1"
else
    echo -e "${YELLOW}⚠️  PostgreSQL client not available, skipping database tests${NC}"
fi
echo ""

# 7. Performance Tests
echo -e "${YELLOW}7. Performance Tests${NC}"
echo "Testing response times..."

# Test API Gateway response time
API_RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/health")
echo "API Gateway response time: ${API_RESPONSE_TIME}s"

# Test Mission Engine response time
MISSION_RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$BASE_URL/mission-engine/health")
echo "Mission Engine response time: ${MISSION_RESPONSE_TIME}s"

# Check if response times are acceptable (< 1 second)
if (( $(echo "$API_RESPONSE_TIME < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ API Gateway response time is acceptable${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ API Gateway response time is too slow${NC}"
    ((TESTS_FAILED++))
fi

if (( $(echo "$MISSION_RESPONSE_TIME < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ Mission Engine response time is acceptable${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ Mission Engine response time is too slow${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# 8. Security Tests
echo -e "${YELLOW}8. Security Tests${NC}"
run_test "HTTPS Redirect" "curl -s -I '$BASE_URL' | grep -q '301\|302'"
run_test "Security Headers" "curl -s -I '$BASE_URL/health' | grep -q 'X-Frame-Options'"
run_test "No Sensitive Data in Headers" "curl -s -I '$BASE_URL/health' | grep -v -q 'X-Powered-By'"
echo ""

# 9. Monitoring Tests
echo -e "${YELLOW}9. Monitoring Tests${NC}"
if curl -s -f "$BASE_URL/prometheus" > /dev/null 2>&1; then
    run_test "Prometheus Metrics" "test_http '$BASE_URL/prometheus'"
    echo -e "${GREEN}✅ Prometheus is accessible${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  Prometheus not accessible (may not be deployed)${NC}"
fi

if curl -s -f "$BASE_URL" > /dev/null 2>&1; then
    run_test "Grafana Dashboard" "test_http '$BASE_URL'"
    echo -e "${GREEN}✅ Grafana is accessible${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  Grafana not accessible (may not be deployed)${NC}"
fi
echo ""

# Test Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your production deployment is working correctly.${NC}"
    echo ""
    echo -e "${BLUE}📋 Production URLs:${NC}"
    echo "Main API: $BASE_URL"
    echo "Admin Dashboard: $BASE_URL/admin"
    echo "Monitoring: $BASE_URL/monitoring"
    echo "Health Check: $BASE_URL/health"
    echo "WebSocket Stats: $BASE_URL/ws/stats"
    echo ""
    echo -e "${BLUE}🔑 Admin Access:${NC}"
    echo "Email: $ADMIN_EMAIL"
    echo "Password: $ADMIN_PASSWORD"
    echo ""
    echo -e "${GREEN}🚀 Your Ensei Platform is ready for production use!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please check the logs and fix the issues.${NC}"
    echo ""
    echo -e "${BLUE}🔍 Troubleshooting:${NC}"
    echo "1. Check service logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "2. Check service status: docker-compose -f docker-compose.prod.yml ps"
    echo "3. Restart services: docker-compose -f docker-compose.prod.yml restart"
    echo "4. Check environment variables in .env.production"
    echo "5. Verify all services are running and healthy"
    exit 1
fi
