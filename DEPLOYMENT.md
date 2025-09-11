# Ensei Platform - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80, 443, 3002-3005 available

### 1. Clone and Setup
```bash
git clone https://github.com/your-org/ensei-platform.git
cd ensei-platform
```

### 2. Environment Configuration
```bash
# Copy production environment template
cp production.env.template .env.production

# Edit the environment file with your actual values
nano .env.production
```

**Important**: Update these critical values:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` - Generate strong random strings
- `ADMIN_PASSWORD` - Change from default
- External API keys for social media platforms
- Database passwords

### 3. Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Verify Deployment
```bash
# Check API Gateway health
curl http://localhost/health

# Check WebSocket stats
curl http://localhost/ws/stats

# Test mission creation
curl -X POST http://localhost/api/v1/missions \
  -H "Content-Type: application/json" \
  -d '{"model":"fixed","platform":"twitter","type":"engage","tasks":["like"],"cap":100}'
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │   API Gateway   │    │  Mission Engine │
│   (Port 80/443) │────│   (Port 3002)   │────│   (Port 3003)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                ┌─────────────┐  ┌─────────────┐
                │   Payment   │  │Verification │
                │  Service    │  │  Service    │
                │ (Port 3004) │  │ (Port 3005) │
                └─────────────┘  └─────────────┘
                       │
                ┌─────────────┐
                │ PostgreSQL  │
                │ (Port 5432) │
                └─────────────┘
```

## 🔧 Service Configuration

### API Gateway (Port 3002)
- **Health Check**: `GET /health`
- **WebSocket**: `ws://localhost/ws`
- **API Routes**: `http://localhost/api/v1/*`

### Mission Engine (Port 3003)
- **Health Check**: `GET /health`
- **Pricing API**: `POST /calculate-pricing`

### Payment Service (Port 3004)
- **Health Check**: `GET /health`
- **Conversion API**: `POST /convert/*`

### Verification Service (Port 3005)
- **Health Check**: `GET /health`
- **Verification API**: `POST /verify/*`

## 📊 Monitoring and Logs

### View Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f postgres
```

### Monitor Resource Usage
```bash
# Container stats
docker stats

# Service health
docker-compose ps
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U ensei_user -d ensei_platform

# Run migrations
docker-compose exec api-gateway npx prisma migrate deploy
```

## 🔒 Security Configuration

### SSL/TLS Setup
1. Place your SSL certificates in `nginx/ssl/`
2. Update `nginx/nginx.conf` to enable HTTPS
3. Redirect HTTP to HTTPS

### Environment Security
- Use strong, unique passwords
- Rotate JWT secrets regularly
- Enable firewall rules
- Use environment-specific API keys

### Database Security
- Change default passwords
- Enable SSL connections
- Regular backups
- Access control

## 🚀 Scaling and Performance

### Horizontal Scaling
```yaml
# Scale specific services
docker-compose up -d --scale api-gateway=3
docker-compose up -d --scale mission-engine=2
```

### Load Balancing
- Nginx handles load balancing
- Multiple API Gateway instances
- Database connection pooling

### Caching
- Redis for session storage
- API response caching
- Database query optimization

## 🔄 Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U ensei_user ensei_platform > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U ensei_user ensei_platform < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v ensei-platform_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose restart service-name
```

**Database connection issues:**
```bash
# Check database status
docker-compose exec postgres pg_isready -U ensei_user

# Check network connectivity
docker-compose exec api-gateway ping postgres
```

**WebSocket connection issues:**
```bash
# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" http://localhost/ws
```

### Performance Issues
- Check resource limits
- Monitor database queries
- Review Nginx configuration
- Check rate limiting settings

## 📈 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database passwords changed
- [ ] JWT secrets rotated
- [ ] API keys configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Health checks working
- [ ] WebSocket connections stable
- [ ] Database migrations applied
- [ ] Log rotation configured
- [ ] Error tracking setup

## 🆘 Support

For issues and support:
- Check logs: `docker-compose logs -f`
- Review this documentation
- Check GitHub issues
- Contact development team

---

**Note**: This is a production-ready setup. Always test in a staging environment first!

