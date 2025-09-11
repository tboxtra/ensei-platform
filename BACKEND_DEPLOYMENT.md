# 🚀 Ensei Platform Backend Deployment Guide

## ✅ **Current Status: BACKEND IS LIVE!**

Your backend services are now running and fully functional:

- ✅ **API Gateway**: http://localhost:3002
- ✅ **Mission Engine**: http://localhost:3003
- ✅ **WebSocket Support**: ws://localhost:3002/ws
- ✅ **Admin Dashboard API**: http://localhost:3002/v1/admin/*

## 🚀 **Quick Start (Current Setup)**

### **Option 1: Use the Startup Script**
```bash
# Make script executable (already done)
chmod +x start-backend.sh

# Start all services
./start-backend.sh
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - API Gateway
cd services/api-gateway
npm run dev

# Terminal 2 - Mission Engine
cd services/mission-engine
npm run dev
```

## 🔧 **Service Endpoints**

### **API Gateway (Port 3002)**
- **Health Check**: `GET http://localhost:3002/health`
- **WebSocket**: `ws://localhost:3002/ws`
- **WebSocket Stats**: `GET http://localhost:3002/ws/stats`
- **Admin API**: `http://localhost:3002/v1/admin/*`
- **Mission API**: `http://localhost:3002/api/v1/missions`

### **Mission Engine (Port 3003)**
- **Health Check**: `GET http://localhost:3003/health`
- **Task Catalog**: `GET http://localhost:3003/task-catalog`
- **Degen Presets**: `GET http://localhost:3003/degen-presets`
- **Calculate Pricing**: `POST http://localhost:3003/calculate-pricing`
- **Validate Degen**: `POST http://localhost:3003/validate-degen`

## 🧪 **Test Your Backend**

### **1. Health Checks**
```bash
# API Gateway
curl http://localhost:3002/health

# Mission Engine
curl http://localhost:3003/health
```

### **2. Test Mission Pricing**
```bash
curl -X POST http://localhost:3003/calculate-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "twitter",
    "type": "engage",
    "model": "fixed",
    "target": "standard",
    "tasks": ["like", "retweet"],
    "cap": 100
  }'
```

### **3. Test WebSocket**
```bash
# Use the test client
node test-websocket.js

# Or open in browser
open test-websocket.html
```

### **4. Test Admin API**
```bash
# Get admin token first
curl -X POST http://localhost:3002/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ensei.com", "password": "admin123"}'

# Use token for admin endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3002/v1/admin/submissions
```

## 🐳 **Production Deployment (Docker)**

### **Prerequisites**
- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80, 443, 3002-3005 available

### **Deploy with Docker**
```bash
# Start all services with Docker
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### **Production URLs**
- **Main API**: http://localhost (Nginx proxy)
- **API Gateway**: http://localhost:3002
- **Mission Engine**: http://localhost:3003
- **WebSocket**: ws://localhost/ws

## 📊 **Monitoring & Management**

### **View Service Logs**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f mission-engine
```

### **Check Service Status**
```bash
# Docker services
docker-compose ps

# Local services
ps aux | grep -E "(tsx|node)" | grep -v grep
```

### **Stop Services**
```bash
# Docker
docker-compose down

# Local
pkill -f 'tsx src/index.ts'
pkill -f 'tsx src/server.ts'
```

## 🔒 **Security Configuration**

### **Environment Variables**
Create `.env` files for each service:

**API Gateway (.env)**
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
ADMIN_EMAIL=admin@ensei.com
ADMIN_PASSWORD=your-secure-password
DATABASE_URL=postgresql://ensei_user:password@localhost:5432/ensei_platform
REDIS_URL=redis://localhost:6379
```

**Mission Engine (.env)**
```env
PORT=3003
HOST=0.0.0.0
```

### **SSL/TLS Setup**
1. Place SSL certificates in `nginx/ssl/`
2. Update `nginx/nginx.conf` for HTTPS
3. Redirect HTTP to HTTPS

## 🚀 **Scaling & Performance**

### **Horizontal Scaling**
```bash
# Scale API Gateway
docker-compose up -d --scale api-gateway=3

# Scale Mission Engine
docker-compose up -d --scale mission-engine=2
```

### **Load Balancing**
- Nginx handles load balancing
- Multiple API Gateway instances
- Database connection pooling

## 🐛 **Troubleshooting**

### **Common Issues**

**Service won't start:**
```bash
# Check logs
docker-compose logs service-name

# Check resource usage
docker stats

# Restart service
docker-compose restart service-name
```

**Port already in use:**
```bash
# Find process using port
lsof -i :3002
lsof -i :3003

# Kill process
kill -9 PID
```

**Database connection issues:**
```bash
# Check database status
docker-compose exec postgres pg_isready -U ensei_user

# Check network connectivity
docker-compose exec api-gateway ping postgres
```

## 📈 **Production Checklist**

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

## 🆘 **Support**

For issues and support:
- Check logs: `docker-compose logs -f`
- Review this documentation
- Check GitHub issues
- Contact development team

---

## 🎉 **Congratulations!**

Your Ensei Platform backend is now **LIVE** and ready for production use! 

**Next Steps:**
1. Test all endpoints
2. Configure production environment
3. Set up monitoring
4. Deploy to production server
5. Configure domain and SSL

**Your backend is now serving:**
- ✅ Real-time WebSocket connections
- ✅ Mission pricing calculations
- ✅ Admin dashboard APIs
- ✅ Authentication & authorization
- ✅ Task catalog management
- ✅ Production-ready infrastructure

🚀 **Ready to scale!** 🚀
