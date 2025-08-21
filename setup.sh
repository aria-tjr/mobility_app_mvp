#!/bin/bash

# Smart Mobility MVP Setup Script
# EIC Accelerator Project - Complete Development Environment Setup

set -e

echo "🚀 Smart Mobility MVP Setup - EIC Accelerator Project"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is installed and running"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        print_status "Visit: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "npm $(npm --version) is installed"
}

# Create necessary directories
create_directories() {
    print_status "Creating project directories..."
    
    mkdir -p backend/src/{routes,services,middleware,database}
    mkdir -p backend/auth-service
    mkdir -p backend/vehicle-service
    mkdir -p backend/ride-engine
    mkdir -p backend/motion-detection
    mkdir -p backend/payment-service
    mkdir -p backend/notification-service
    
    mkdir -p frontend/mobile-app
    mkdir -p frontend/operator-dashboard/src/{components,pages,context,utils}
    
    mkdir -p vehicle-simulator/src/{simulators,routes,scenarios,telemetry}
    mkdir -p vehicle-simulator/public
    
    mkdir -p database/{init,migrations,seeds}
    mkdir -p infrastructure/{docker,kubernetes}
    mkdir -p docs/{api,architecture,deployment}
    
    print_success "Project directories created"
}

# Install root dependencies
install_root_dependencies() {
    print_status "Installing root project dependencies..."
    npm install
    print_success "Root dependencies installed"
}

# Install backend dependencies
install_backend_dependencies() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Install vehicle simulator dependencies
install_simulator_dependencies() {
    print_status "Installing vehicle simulator dependencies..."
    cd vehicle-simulator
    npm install
    cd ..
    print_success "Vehicle simulator dependencies installed"
}

# Install operator dashboard dependencies
install_dashboard_dependencies() {
    print_status "Installing operator dashboard dependencies..."
    cd frontend/operator-dashboard
    npm install
    cd ../..
    print_success "Operator dashboard dependencies installed"
}

# Setup database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL container is running
    if ! docker ps | grep -q smart_mobility_postgres; then
        print_status "Starting PostgreSQL container..."
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        print_status "Waiting for PostgreSQL to be ready..."
        sleep 10
        
        # Check if database is accessible
        if ! docker exec smart_mobility_postgres pg_isready -U mobility_user -d smart_mobility; then
            print_error "PostgreSQL is not ready. Please check the logs."
            docker-compose logs postgres
            exit 1
        fi
    fi
    
    print_success "PostgreSQL database is ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Copy schema file to init directory
    cp database/schema.sql database/init/01_schema.sql
    
    # Restart PostgreSQL to run init scripts
    docker-compose restart postgres
    
    # Wait for migrations to complete
    sleep 5
    
    print_success "Database migrations completed"
}

# Build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    docker-compose build
    print_success "Docker images built successfully"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 15
    
    print_success "All services started successfully"
}

# Check service health
check_services() {
    print_status "Checking service health..."
    
    # Check API Gateway
    if curl -s http://localhost:3000/health | grep -q "healthy"; then
        print_success "API Gateway is healthy"
    else
        print_error "API Gateway is not responding"
    fi
    
    # Check Vehicle Simulator
    if curl -s http://localhost:3002/health | grep -q "healthy"; then
        print_success "Vehicle Simulator is healthy"
    else
        print_error "Vehicle Simulator is not responding"
    fi
    
    # Check PostgreSQL
    if docker exec smart_mobility_postgres pg_isready -U mobility_user -d smart_mobility; then
        print_success "PostgreSQL is healthy"
    else
        print_error "PostgreSQL is not responding"
    fi
    
    # Check Redis
    if docker exec smart_mobility_redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis is healthy"
    else
        print_error "Redis is not responding"
    fi
}

# Setup development environment
setup_dev_environment() {
    print_status "Setting up development environment..."
    
    # Create .env files if they don't exist
    if [ ! -f .env ]; then
        cat > .env << EOF
# Smart Mobility MVP Environment Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://mobility_user:mobility_pass_2024@localhost:5432/smart_mobility
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=eic_accelerator_jwt_secret_2024

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_51ABC123DEF456GHI789JKL
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456GHI789JKL

# Frontend URLs
FRONTEND_URL=http://localhost:3003
MOBILE_APP_URL=http://localhost:3004

# Simulator
SIMULATOR_PORT=3002

# ML Model Path
ML_MODEL_PATH=./models
EOF
        print_success ".env file created"
    fi
    
    # Create backend .env
    if [ ! -f backend/.env ]; then
        cp .env backend/.env
        print_success "Backend .env file created"
    fi
    
    # Create simulator .env
    if [ ! -f vehicle-simulator/.env ]; then
        cp .env vehicle-simulator/.env
        print_success "Vehicle simulator .env file created"
    fi
}

# Display startup instructions
display_instructions() {
    echo ""
    echo "🎉 Setup completed successfully!"
    echo "=================================="
    echo ""
    echo "🚀 To start the development environment:"
    echo "   npm run dev"
    echo ""
    echo "📱 To start the mobile app:"
    echo "   npm run mobile:dev"
    echo ""
    echo "🎮 To run the EIC demo:"
    echo "   npm run eic:demo"
    echo ""
    echo "🔧 Available commands:"
    echo "   npm run backend:dev      - Start backend only"
    echo "   npm run dashboard:dev    - Start operator dashboard only"
    echo "   npm run simulator:dev    - Start vehicle simulator only"
    echo "   npm run docker:up        - Start all Docker services"
    echo "   npm run docker:down      - Stop all Docker services"
    echo ""
    echo "🌐 Service URLs:"
    echo "   API Gateway:     http://localhost:3000"
    echo "   Vehicle Sim:     http://localhost:3002"
    echo "   Operator Dash:   http://localhost:3003"
    echo "   PostgreSQL:      localhost:5432"
    echo "   Redis:           localhost:6379"
    echo ""
    echo "📊 EIC Accelerator Demo:"
    echo "   1. Open http://localhost:3003/eic-demo"
    echo "   2. Click 'Start Demo' to begin the 60-second innovation showcase"
    echo "   3. Watch the Smart Pause & Resume system in action"
    echo ""
    echo "🔒 Default credentials:"
    echo "   Database: mobility_user / mobility_pass_2024"
    echo "   Stripe: Test mode (use test card numbers)"
    echo ""
    echo "📚 Documentation:"
    echo "   README.md - Project overview and architecture"
    echo "   docs/     - Detailed technical documentation"
    echo ""
    echo "🚨 Troubleshooting:"
    echo "   - Check Docker containers: docker-compose ps"
    echo "   - View logs: docker-compose logs [service_name]"
    echo "   - Restart services: docker-compose restart"
    echo ""
}

# Main setup function
main() {
    echo "Starting Smart Mobility MVP setup..."
    echo ""
    
    # Pre-flight checks
    check_docker
    check_node
    check_npm
    
    # Create project structure
    create_directories
    
    # Install dependencies
    install_root_dependencies
    install_backend_dependencies
    install_simulator_dependencies
    install_dashboard_dependencies
    
    # Setup environment
    setup_dev_environment
    
    # Setup database
    setup_database
    run_migrations
    
    # Build and start services
    build_docker_images
    start_services
    
    # Verify everything is working
    check_services
    
    # Display instructions
    display_instructions
}

# Run main function
main "$@"
