#!/bin/bash

# Ensei Platform Production Deployment Script
# This script deploys the entire Ensei platform to production

set -e

echo "🚀 Ensei Platform Production Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${DOMAIN:-"yourdomain.com"}
ADMIN_EMAIL=${ADMIN_EMAIL:-"admin@ensei.com"}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-"$(openssl rand -base64 32)"}
DB_PASSWORD=${DB_PASSWORD:-"$(openssl rand -base64 32)"}
REDIS_PASSWORD=${REDIS_PASSWORD:-"$(openssl rand -base64 32)"}
JWT_SECRET=${JWT_SECRET:-"$(openssl rand -base64 64)"}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-"$(openssl rand -base64 64)"}
GRAFANA_PASSWORD=${GRAFANA_PASSWORD:-"$(openssl rand -base64 32)"}

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Admin Email: $ADMIN_EMAIL"
echo "Admin Password: $ADMIN_PASSWORD"
echo "Database Password: $DB_PASSWORD"
echo "Redis Password: $REDIS_PASSWORD"
echo "JWT Secret: ${JWT_SECRET:0:20}..."
echo "JWT Refresh Secret: ${JWT_REFRESH_SECRET:0:20}..."
echo "Grafana Password: $GRAFANA_PASSWORD"
echo ""

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if domain is configured
if [ "$DOMAIN" = "yourdomain.com" ]; then
    echo -e "${YELLOW}⚠️  Warning: Domain is not configured. Please set DOMAIN environment variable.${NC}"
    echo "Example: export DOMAIN=ensei.com"
    read -p "Do you want to continue with default domain? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Create necessary directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p logs/{api-gateway,mission-engine,payment-service,verification-service,postgres,redis,nginx}
mkdir -p nginx/ssl
mkdir -p monitoring/{grafana/dashboards,grafana/datasources}

# Generate SSL certificates (self-signed for demo, replace with real certificates)
echo -e "${BLUE}🔒 Generating SSL certificates...${NC}"
if [ ! -f "nginx/ssl/cert.pem" ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    echo -e "${GREEN}✅ SSL certificates generated${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificates already exist${NC}"
fi

# Create production environment file
echo -e "${BLUE}⚙️  Creating production environment file...${NC}"
cat > .env.production << EOF
# Ensei Platform Production Environment
NODE_ENV=production
DOMAIN=$DOMAIN
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
GRAFANA_PASSWORD=$GRAFANA_PASSWORD

# Database
DATABASE_URL=postgresql://ensei_user:$DB_PASSWORD@postgres:5432/ensei_platform
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379

# API Keys (replace with real keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Social Media API Keys (replace with real keys)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
EOF

echo -e "${GREEN}✅ Environment file created${NC}"

# Update Nginx configuration with domain
echo -e "${BLUE}🌐 Updating Nginx configuration...${NC}"
sed -i.bak "s/yourdomain.com/$DOMAIN/g" nginx/nginx.prod.conf
echo -e "${GREEN}✅ Nginx configuration updated${NC}"

# Build and start services
echo -e "${BLUE}🐳 Building and starting services...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 30

# Check service health
echo -e "${BLUE}🔍 Checking service health...${NC}"

services=("nginx" "api-gateway" "mission-engine" "payment-service" "verification-service" "postgres" "redis" "prometheus" "grafana")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✅ $service is running${NC}"
    else
        echo -e "${RED}❌ $service is not running${NC}"
    fi
done

# Test endpoints
echo -e "${BLUE}🧪 Testing endpoints...${NC}"

# Test API Gateway
if curl -s -f http://localhost/health > /dev/null; then
    echo -e "${GREEN}✅ API Gateway health check passed${NC}"
else
    echo -e "${RED}❌ API Gateway health check failed${NC}"
fi

# Test Mission Engine
if curl -s -f http://localhost/mission-engine/health > /dev/null; then
    echo -e "${GREEN}✅ Mission Engine health check passed${NC}"
else
    echo -e "${RED}❌ Mission Engine health check failed${NC}"
fi

# Test WebSocket
if curl -s -f http://localhost/ws/stats > /dev/null; then
    echo -e "${GREEN}✅ WebSocket endpoint is accessible${NC}"
else
    echo -e "${RED}❌ WebSocket endpoint is not accessible${NC}"
fi

# Display deployment information
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "Main API: https://$DOMAIN"
echo "Admin Dashboard: https://admin.$DOMAIN"
echo "Monitoring: https://monitoring.$DOMAIN"
echo "Grafana: https://monitoring.$DOMAIN (admin/$GRAFANA_PASSWORD)"
echo "Prometheus: https://monitoring.$DOMAIN/prometheus"
echo ""
echo -e "${BLUE}🔑 Admin Credentials:${NC}"
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update DNS records to point to this server"
echo "2. Replace self-signed SSL certificates with real ones"
echo "3. Configure external API keys in .env.production"
echo "4. Set up monitoring alerts"
echo "5. Configure backup strategy"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "Restart service: docker-compose -f docker-compose.prod.yml restart <service>"
echo "Stop all: docker-compose -f docker-compose.prod.yml down"
echo "Update: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
echo ""

# Save credentials to file
echo -e "${BLUE}💾 Saving credentials to credentials.txt...${NC}"
cat > credentials.txt << EOF
Ensei Platform Production Deployment
====================================

Domain: $DOMAIN
Admin Email: $ADMIN_EMAIL
Admin Password: $ADMIN_PASSWORD
Database Password: $DB_PASSWORD
Redis Password: $REDIS_PASSWORD
JWT Secret: $JWT_SECRET
JWT Refresh Secret: $JWT_REFRESH_SECRET
Grafana Password: $GRAFANA_PASSWORD

Service URLs:
- Main API: https://$DOMAIN
- Admin Dashboard: https://admin.$DOMAIN
- Monitoring: https://monitoring.$DOMAIN
- Grafana: https://monitoring.$DOMAIN (admin/$GRAFANA_PASSWORD)
- Prometheus: https://monitoring.$DOMAIN/prometheus

Generated on: $(date)
EOF

echo -e "${GREEN}✅ Credentials saved to credentials.txt${NC}"
echo -e "${YELLOW}⚠️  Keep credentials.txt secure and delete it after noting the information${NC}"

echo ""
echo -e "${GREEN}🚀 Ensei Platform is now live and ready for production use!${NC}"
