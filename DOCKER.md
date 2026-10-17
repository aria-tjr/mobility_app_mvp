# 🐳 Docker Setup & Management

**Smart Pause & Resume Vehicle Sharing Platform**

This document provides comprehensive instructions for building, running, and managing the Smart Pause & Resume platform using Docker containers.

## 🎯 **Overview**

Our platform uses **Docker containers** to provide a consistent, scalable development and deployment environment for the **Smart Pause & Resume innovation**. The containerized architecture ensures that our revolutionary motion-recognition technology works identically across all environments.

### **Architecture Benefits**
- **Consistency**: Same environment across development, testing, and production
- **Scalability**: Easy horizontal scaling for 1000+ concurrent vehicles
- **Isolation**: Each service runs independently with clear boundaries
- **Portability**: Deploy anywhere Docker is supported
- **EIC Demo Ready**: Perfect environment for innovation showcases

## 🏗️ **Service Architecture**

### **Container Services**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis       │    │  API Gateway    │
│   (Port 5434)   │    │   (Port 6380)    │    │  (Port 3000)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Motion Detection│    │Vehicle Simulator │    │Operator Dashboard│
│  (Port 3001)    │    │  (Port 3002)     │    │  (Port 3003)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### **Service Dependencies**
- **PostgreSQL**: Primary data storage for Smart Pause schemas
- **Redis**: Real-time caching and session management
- **API Gateway**: Smart Pause & Resume API endpoints
- **Motion Detection**: Python ML service for motion recognition
- **Vehicle Simulator**: Telemetry simulation for EIC demo
- **Operator Dashboard**: React-based fleet management interface

## 🚀 **Quick Start**

### **Prerequisites**
```bash
# Install Docker Desktop
# macOS: https://docs.docker.com/desktop/mac/install/
# Windows: https://docs.docker.com/desktop/windows/install/
# Linux: https://docs.docker.com/engine/install/

# Verify installation
docker --version
docker-compose --version
```

### **1. Clone Repository**
```bash
git clone https://github.com/your-org/mobility_app_mvp.git
cd mobility_app_mvp
```

### **2. Start All Services**
```bash
# Start all services in background
docker-compose up -d

# View service status
docker-compose ps

# Check service logs
docker-compose logs -f
```

### **3. Verify Services**
```bash
# Test API Gateway
curl http://localhost:3000/health

# Test Operator Dashboard
curl http://localhost:3003

# Test Vehicle Simulator
curl http://localhost:3002/health

# Test Motion Detection
curl http://localhost:3001/health
```

## 🔧 **Service Configuration**

### **Environment Variables**
```bash
# Database Configuration
POSTGRES_DB=smart_mobility
POSTGRES_USER=mobility_user
POSTGRES_PASSWORD=change-me

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=<generate-a-long-random-secret>

# Stripe Configuration
STRIPE_SECRET_KEY=<your-stripe-test-secret-key>

# Service URLs
API_GATEWAY_URL=http://api-gateway:3000
MOTION_DETECTION_URL=http://motion-detection:3001
```

### **Port Mappings**
```yaml
# Service Ports
postgres:     5434:5432    # Database
redis:        6380:6379    # Cache
api-gateway:  3000:3000    # Backend API
motion-detection: 3001:3001 # ML Service
vehicle-simulator: 3002:3002 # Simulator
operator-dashboard: 3003:3000 # Frontend
```

## 🐳 **Dockerfile Details**

### **API Gateway Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

### **Motion Detection Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the service
CMD ["python", "src/app.py"]
```

### **Operator Dashboard Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
```

## 📊 **Service Management**

### **Start Services**
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d api-gateway

# Start with rebuild
docker-compose up -d --build

# Start in foreground (for debugging)
docker-compose up
```

### **Stop Services**
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop api-gateway
```

### **Service Monitoring**
```bash
# View service status
docker-compose ps

# View service logs
docker-compose logs -f api-gateway
docker-compose logs -f motion-detection
docker-compose logs -f vehicle-simulator

# View all logs
docker-compose logs -f

# Monitor resource usage
docker stats
```

## 🧪 **Development Environment**

### **Development Mode**
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Development features:
# - Hot reload for code changes
# - Volume mounting for live editing
# - Debug ports exposed
# - Development dependencies included
```

### **Volume Mounting**
```yaml
# Development volumes
volumes:
  - ./backend:/app                    # Backend code
  - ./frontend/operator-dashboard:/app # Frontend code
  - ./vehicle-simulator:/app          # Simulator code
  - /app/node_modules                  # Preserve container node_modules
```

### **Hot Reload**
```bash
# Backend hot reload
docker-compose exec api-gateway npm run dev

# Frontend hot reload
docker-compose exec operator-dashboard npm start

# Motion detection hot reload
docker-compose exec motion-detection python -m uvicorn src.app:app --reload
```

## 🚀 **Production Deployment**

### **Production Build**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Production features:
# - Optimized images
# - Security hardening
# - Performance tuning
# - Health checks
```

### **Production Configuration**
```yaml
# Production environment
environment:
  NODE_ENV: production
  DATABASE_URL: ${PROD_DATABASE_URL}
  REDIS_URL: ${PROD_REDIS_URL}
  JWT_SECRET: ${PROD_JWT_SECRET}
  STRIPE_SECRET_KEY: ${PROD_STRIPE_SECRET_KEY}

# Production volumes
volumes:
  - postgres_data:/var/lib/postgresql/data
  - redis_data:/data
  - app_logs:/app/logs
```

### **Health Checks**
```yaml
# Health check configuration
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🔒 **Security Configuration**

### **Network Security**
```yaml
# Isolated network
networks:
  mobility_network:
    driver: bridge
    internal: false  # Allow external access for development

# Service communication
services:
  api-gateway:
    networks:
      - mobility_network
    ports:
      - "3000:3000"  # Expose API gateway
```

### **Data Security**
```yaml
# Encrypted volumes
volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/secure/storage

# Environment variable security
environment:
  - JWT_SECRET=${JWT_SECRET}
  - DATABASE_URL=${DATABASE_URL}
  - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
```

## 📈 **Scaling & Performance**

### **Horizontal Scaling**
```bash
# Scale API gateway
docker-compose up -d --scale api-gateway=3

# Scale motion detection
docker-compose up -d --scale motion-detection=2

# Scale with load balancer
docker-compose -f docker-compose.scale.yml up -d
```

### **Resource Limits**
```yaml
# Resource constraints
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### **Performance Monitoring**
```bash
# Monitor container performance
docker stats

# Monitor service logs
docker-compose logs -f --tail=100

# Monitor resource usage
docker system df
docker system prune
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Service Won't Start**
```bash
# Check service logs
docker-compose logs api-gateway

# Check service status
docker-compose ps

# Restart service
docker-compose restart api-gateway

# Rebuild service
docker-compose up -d --build api-gateway
```

#### **Database Connection Issues**
```bash
# Check database status
docker-compose exec postgres pg_isready

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### **Port Conflicts**
```bash
# Check port usage
lsof -i :3000
lsof -i :5434

# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Change host port
```

### **Debug Mode**
```bash
# Start with debug logging
docker-compose up -d --verbose

# Access container shell
docker-compose exec api-gateway sh
docker-compose exec motion-detection bash

# View container details
docker inspect smart_mobility_api
```

## 🎬 **EIC Demo Environment**

### **Demo Configuration**
```bash
# Start EIC demo environment
docker-compose -f docker-compose.eic-demo.yml up -d

# Demo features:
# - Pre-configured test data
# - Demo scenarios ready
# - Performance monitoring
# - Innovation showcase ready
```

### **Demo Scenarios**
```bash
# Test traffic stop simulation
curl -X POST http://localhost:3000/api/telemetry/simulate/traffic_stop

# Test user pause
curl -X POST http://localhost:3000/api/telemetry/simulate/user_pause

# Test unauthorized movement
curl -X POST http://localhost:3000/api/telemetry/simulate/unauthorized_movement

# Start EIC demo
curl -X POST http://localhost:3000/api/telemetry/simulate/eic_demo
```

### **Demo Monitoring**
```bash
# Monitor demo progress
curl http://localhost:3000/api/telemetry/fleet/analytics

# View demo logs
docker-compose logs -f vehicle-simulator

# Check demo status
curl http://localhost:3002/api/demo/status
```

## 🔄 **Continuous Integration**

### **CI/CD Pipeline**
```yaml
# GitHub Actions example
name: Docker CI/CD
on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker images
        run: docker-compose build
      - name: Run tests
        run: docker-compose -f docker-compose.test.yml up -d
      - name: Test Smart Pause
        run: npm run test:smart-pause
```

### **Automated Testing**
```bash
# Test environment
docker-compose -f docker-compose.test.yml up -d

# Run tests
npm run test:backend
npm run test:frontend
npm run test:integration

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

## 📚 **Best Practices**

### **Development Best Practices**
1. **Use Volumes**: Mount source code for live editing
2. **Environment Variables**: Never hardcode secrets
3. **Health Checks**: Implement proper health monitoring
4. **Logging**: Use structured logging for debugging
5. **Resource Limits**: Set appropriate resource constraints

### **Production Best Practices**
1. **Security**: Use secrets management
2. **Monitoring**: Implement comprehensive monitoring
3. **Backup**: Regular database and volume backups
4. **Updates**: Keep base images updated
5. **Documentation**: Document all configuration changes

### **Performance Best Practices**
1. **Multi-stage Builds**: Optimize image sizes
2. **Layer Caching**: Optimize Docker layer caching
3. **Resource Optimization**: Right-size containers
4. **Network Optimization**: Use appropriate network drivers
5. **Storage Optimization**: Use appropriate volume drivers

## 🎯 **Customization**

### **Custom Services**
```yaml
# Add custom service
custom-service:
  build:
    context: ./custom-service
    dockerfile: Dockerfile
  ports:
    - "3004:3000"
  environment:
    - CUSTOM_VAR=value
  depends_on:
    - api-gateway
```

### **Custom Networks**
```yaml
# Custom network configuration
networks:
  custom_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### **Custom Volumes**
```yaml
# Custom volume configuration
volumes:
  custom_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /custom/path
```

## 📞 **Support & Resources**

### **Documentation**
- **Docker Official Docs**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/

### **Community Support**
- **GitHub Issues**: Report bugs and request features
- **Docker Forums**: Community support and discussions
- **Stack Overflow**: Technical questions and answers

### **Professional Support**
- **Email**: docker-support@smartpause-mobility.com
- **Documentation**: https://docs.smartpause-mobility.com/docker
- **Training**: Custom Docker training and workshops

## 🎉 **Conclusion**

Docker provides the perfect environment for developing, testing, and deploying our **Smart Pause & Resume innovation**. The containerized architecture ensures consistency, scalability, and reliability across all environments.

**Containerized innovation for the future of urban mobility!** 🚀

---

*For Docker-specific questions, please contact docker-support@smartpause-mobility.com or open a GitHub issue*
