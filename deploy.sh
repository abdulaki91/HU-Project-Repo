#!/bin/bash

# Haramaya University Project Store Deployment Script
# This script handles both development and production deployments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="haramaya-university-project-store"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    success "Docker and Docker Compose are installed"
}

# Check if required files exist
check_files() {
    local required_files=(".env" "docker-compose.yml")
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required file $file not found. Please create it from the example file."
        fi
    done
    
    success "All required files are present"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    local backup_name="backup_$(date +'%Y%m%d_%H%M%S')"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    # Backup database
    if docker-compose ps mysql | grep -q "Up"; then
        log "Backing up database..."
        docker-compose exec -T mysql mysqldump -u root -p"${DB_ROOT_PASSWORD:-rootpassword}" "${DB_NAME:-projectrepo}" > "$backup_path.sql"
        success "Database backup created: $backup_path.sql"
    fi
    
    # Backup uploads
    if [[ -d "./Backend/uploads" ]]; then
        log "Backing up uploads..."
        tar -czf "$backup_path.uploads.tar.gz" -C "./Backend" uploads/
        success "Uploads backup created: $backup_path.uploads.tar.gz"
    fi
}

# Deploy development environment
deploy_dev() {
    log "Deploying development environment..."
    
    # Stop existing containers
    docker-compose -f docker-compose.dev.yml down
    
    # Pull latest images
    docker-compose -f docker-compose.dev.yml pull
    
    # Build and start services
    docker-compose -f docker-compose.dev.yml up -d --build
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
        success "Development environment deployed successfully!"
        log "Frontend: http://localhost:5173"
        log "Backend: http://localhost:5000"
        log "Database: localhost:3306"
    else
        error "Some services failed to start. Check logs with: docker-compose -f docker-compose.dev.yml logs"
    fi
}

# Deploy production environment
deploy_prod() {
    log "Deploying production environment..."
    
    # Create backup before deployment
    create_backup
    
    # Stop existing containers
    docker-compose --profile production down
    
    # Pull latest images
    docker-compose --profile production pull
    
    # Build and start services
    docker-compose --profile production up -d --build
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 60
    
    # Check if services are running
    if docker-compose --profile production ps | grep -q "Up"; then
        success "Production environment deployed successfully!"
        log "Application: http://localhost"
        log "API: http://localhost/api"
    else
        error "Some services failed to start. Check logs with: docker-compose --profile production logs"
    fi
    
    # Run health checks
    health_check
}

# Health check
health_check() {
    log "Running health checks..."
    
    local services=("frontend" "backend" "mysql")
    local failed_services=()
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up (healthy)"; then
            success "$service is healthy"
        else
            warning "$service health check failed"
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -eq 0 ]]; then
        success "All services are healthy!"
    else
        warning "Some services failed health checks: ${failed_services[*]}"
        log "Check logs with: docker-compose logs <service_name>"
    fi
}

# Show logs
show_logs() {
    local service="$1"
    local compose_file="docker-compose.yml"
    
    if [[ "$2" == "dev" ]]; then
        compose_file="docker-compose.dev.yml"
    fi
    
    if [[ -n "$service" ]]; then
        docker-compose -f "$compose_file" logs -f "$service"
    else
        docker-compose -f "$compose_file" logs -f
    fi
}

# Stop services
stop_services() {
    local env="$1"
    
    if [[ "$env" == "dev" ]]; then
        log "Stopping development services..."
        docker-compose -f docker-compose.dev.yml down
    else
        log "Stopping production services..."
        docker-compose --profile production down
    fi
    
    success "Services stopped"
}

# Clean up
cleanup() {
    log "Cleaning up..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful with this)
    read -p "Do you want to remove unused volumes? This will delete data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        warning "Unused volumes removed"
    fi
    
    success "Cleanup completed"
}

# Show status
show_status() {
    log "Service Status:"
    echo
    
    echo "Development Services:"
    docker-compose -f docker-compose.dev.yml ps
    echo
    
    echo "Production Services:"
    docker-compose --profile production ps
    echo
    
    echo "System Resources:"
    docker system df
}

# Update application
update_app() {
    log "Updating application..."
    
    # Pull latest code (if using git)
    if [[ -d ".git" ]]; then
        log "Pulling latest code..."
        git pull origin main
    fi
    
    # Rebuild and restart services
    if [[ "$1" == "dev" ]]; then
        docker-compose -f docker-compose.dev.yml up -d --build
    else
        create_backup
        docker-compose --profile production up -d --build
    fi
    
    success "Application updated"
}

# Show help
show_help() {
    echo "Haramaya University Project Store Deployment Script"
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  dev                 Deploy development environment"
    echo "  prod                Deploy production environment"
    echo "  stop [dev|prod]     Stop services"
    echo "  logs [service] [dev] Show logs"
    echo "  status              Show service status"
    echo "  health              Run health checks"
    echo "  backup              Create backup"
    echo "  update [dev|prod]   Update application"
    echo "  cleanup             Clean up unused Docker resources"
    echo "  help                Show this help message"
    echo
    echo "Examples:"
    echo "  $0 dev              # Deploy development environment"
    echo "  $0 prod             # Deploy production environment"
    echo "  $0 logs backend     # Show backend logs"
    echo "  $0 logs backend dev # Show backend logs (dev environment)"
    echo "  $0 stop dev         # Stop development services"
    echo "  $0 update prod      # Update production environment"
}

# Main script
main() {
    local command="$1"
    
    # Create log file
    touch "$LOG_FILE"
    
    log "Starting deployment script for $PROJECT_NAME"
    
    case "$command" in
        "dev")
            check_docker
            deploy_dev
            ;;
        "prod")
            check_docker
            check_files
            deploy_prod
            ;;
        "stop")
            stop_services "$2"
            ;;
        "logs")
            show_logs "$2" "$3"
            ;;
        "status")
            show_status
            ;;
        "health")
            health_check
            ;;
        "backup")
            create_backup
            ;;
        "update")
            update_app "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            error "Unknown command: $command. Use '$0 help' for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"