#!/bin/bash

# VELES DRIVE - Docker Environment Test Script
echo "🚗 Testing VELES DRIVE Docker Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local url="$1"
    local description="$2"
    
    echo -n "Testing $description... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 15

# Test API endpoints
echo -e "\n${BLUE}🔍 Testing API endpoints:${NC}"

test_endpoint "http://localhost:8001/api/health" "Health Check"
test_endpoint "http://localhost:8001/api/" "API Root"

# Test database connectivity
echo -e "\n${BLUE}🗄️ Testing database connectivity:${NC}"
if docker exec veles_mongodb mongosh --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "Database connection... ${GREEN}✅ OK${NC}"
else
    echo -e "Database connection... ${RED}❌ FAILED${NC}"
fi

# Test Redis
echo -e "\n${BLUE}🚀 Testing Redis:${NC}"
if docker exec veles_redis redis-cli ping | grep -q "PONG"; then
    echo -e "Redis connection... ${GREEN}✅ OK${NC}"
else
    echo -e "Redis connection... ${RED}❌ FAILED${NC}"
fi

# Check container status
echo -e "\n${BLUE}📊 Container Status:${NC}"
docker-compose ps

# Check container logs for errors
echo -e "\n${BLUE}📝 Checking for errors in logs:${NC}"
if docker-compose logs app | grep -i "error\|exception\|failed" > /dev/null; then
    echo -e "Application logs... ${YELLOW}⚠️ Found errors${NC}"
    echo "Run 'docker-compose logs app' to see details"
else
    echo -e "Application logs... ${GREEN}✅ Clean${NC}"
fi

# Performance test
echo -e "\n${BLUE}⚡ Performance test:${NC}"
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8001/api/health)
echo "API response time: ${response_time}s"

if (( $(echo "$response_time < 1.0" | bc -l) )); then
    echo -e "Response time... ${GREEN}✅ Good${NC}"
elif (( $(echo "$response_time < 3.0" | bc -l) )); then
    echo -e "Response time... ${YELLOW}⚠️ Acceptable${NC}"
else
    echo -e "Response time... ${RED}❌ Slow${NC}"
fi

# Memory usage
echo -e "\n${BLUE}💾 Memory usage:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo -e "\n${GREEN}🎉 Docker environment test completed!${NC}"
echo -e "${BLUE}Access your application at: http://localhost:8001${NC}"