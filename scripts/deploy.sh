#!/bin/bash

# Haramaya University Project Store - Production Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="haramaya-project-store"
BACKUP_DIR="/var/backups/hups"
LOG_FILE="/var/log/hups-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        error "Git is not installed"
    fi
    
    success "All prerequisites are met"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker-compose ps mysql | grep -q "Up"; then
        log "Backing up database..."
        docker-compose exec -T mysql mysqldump -u root -p"$DB_ROOT_PASSWORD" projectrepo > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        success "Database backup created"
    fi
    
    # Backup uploads
    if [ -d "Backend/uploads" ]; then
        log "Backing up uploads..."
        sudo tar -czf "$BACKUP_DIR/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" Backend/uploads/
        success "Uploads backup created"
    fi
    
    # Keep only last 7 backups
    sudo find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete
    sudo find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
}

# Update application
update_application() {
    log "Updating application..."
    
    # Pull latest changes
    git fetch origin
    git pull origin main
    
    success "Application updated"
}

# Build and deploy
build_and_deploy() {
    log "Building and deploying..."
    
    # Stop services
    docker-compose down
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30
    
    # Check health
    check_health
    
    success "Deployment completed"
}

# Check application health
check_health() {
    log "Checking application health..."
    
    # Check backend health
    if curl -f -s http://localhost:5000/health > /dev/null; then
        success "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        success "Frontend is accessible"
    else
        warning "Frontend accessibility check failed"
    fi
    
    # Check database
    if docker-compose exec -T mysql mysql -u root -p"$DB_ROOT_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
        success "Database is accessible"
    else
        error "Database connection failed"
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    cat > /tmp/monitor-hups.sh << 'EOF'
#!/bin/bash
# Health monitoring script

check_service() {
    if docker-compose ps $1 | grep -q "Up"; then
        echo "✓ $1 is running"
    else
        echo "✗ $1 is not running"
        docker-compose restart $1
    fi
}

check_service mysql
check_service backend
check_service frontend
check_service nginx
EOF

    sudo mv /tmp/monitor-hups.sh /usr/local/bin/monitor-hups.sh
    sudo chmod +x /usr/local/bin/monitor-hups.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-hups.sh >> /var/log/hups-monitor.log 2>&1") | crontab -
    
    success "Monitoring setup completed"
}

# Setup SSL renewal
setup_ssl_renewal() {
    log "Setting up SSL certificate renewal..."
    
    # Add certbot renewal to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx") | crontab -
    
    success "SSL renewal setup completed"
}

# Main deployment function
main() {
    log "Starting deployment of $PROJECT_NAME"
    
    # Load environment variables
    if [ -f "Backend/.env" ]; then
        source Backend/.env
    else
        error "Backend/.env file not found"
    fi
    
    check_root
    check_prerequisites
    create_backup
    update_application
    build_and_deploy
    setup_monitoring
    setup_ssl_renewal
    
    success "Deployment completed successfully!"
    log "Application is available at: $CLIENT_URL"
    log "API is available at: $BACKEND_URL"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        create_backup
        ;;
    "health")
        check_health
        ;;
    "update")
        update_application
        build_and_deploy
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "stop")
        docker-compose down
        ;;
    "start")
        docker-compose up -d
        ;;
    "restart")
        docker-compose restart
        ;;
    *)
        echo "Usage: $0 {deploy|backup|health|update|logs|stop|start|restart}"
        exit 1
        ;;
esac