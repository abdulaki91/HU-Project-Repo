@echo off
setlocal enabledelayedexpansion

:: Haramaya University Project Store Deployment Script (Windows)
:: This script handles both development and production deployments

set PROJECT_NAME=haramaya-university-project-store
set BACKUP_DIR=.\backups
set LOG_FILE=.\deploy.log

:: Colors (limited in Windows CMD)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

:: Functions
goto :main

:log
echo %BLUE%[%date% %time%]%NC% %~1
echo [%date% %time%] %~1 >> "%LOG_FILE%"
goto :eof

:error
echo %RED%[ERROR]%NC% %~1
echo [ERROR] %~1 >> "%LOG_FILE%"
exit /b 1

:success
echo %GREEN%[SUCCESS]%NC% %~1
echo [SUCCESS] %~1 >> "%LOG_FILE%"
goto :eof

:warning
echo %YELLOW%[WARNING]%NC% %~1
echo [WARNING] %~1 >> "%LOG_FILE%"
goto :eof

:check_docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    call :error "Docker is not installed. Please install Docker first."
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    call :error "Docker Compose is not installed. Please install Docker Compose first."
    exit /b 1
)

call :success "Docker and Docker Compose are installed"
goto :eof

:check_files
if not exist ".env" (
    call :error "Required file .env not found. Please create it from the example file."
    exit /b 1
)

if not exist "docker-compose.yml" (
    call :error "Required file docker-compose.yml not found."
    exit /b 1
)

call :success "All required files are present"
goto :eof

:create_backup
call :log "Creating backup..."

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set backup_name=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backup_name=%backup_name: =0%

:: Backup database if MySQL is running
docker-compose ps mysql | findstr "Up" >nul
if %errorlevel% equ 0 (
    call :log "Backing up database..."
    docker-compose exec -T mysql mysqldump -u root -p"%DB_ROOT_PASSWORD%" "%DB_NAME%" > "%BACKUP_DIR%\%backup_name%.sql"
    if %errorlevel% equ 0 (
        call :success "Database backup created: %BACKUP_DIR%\%backup_name%.sql"
    )
)

:: Backup uploads
if exist ".\Backend\uploads" (
    call :log "Backing up uploads..."
    powershell -command "Compress-Archive -Path '.\Backend\uploads' -DestinationPath '%BACKUP_DIR%\%backup_name%.uploads.zip' -Force"
    if %errorlevel% equ 0 (
        call :success "Uploads backup created: %BACKUP_DIR%\%backup_name%.uploads.zip"
    )
)
goto :eof

:deploy_dev
call :log "Deploying development environment..."

:: Stop existing containers
docker-compose -f docker-compose.dev.yml down

:: Pull latest images
docker-compose -f docker-compose.dev.yml pull

:: Build and start services
docker-compose -f docker-compose.dev.yml up -d --build

:: Wait for services to be ready
call :log "Waiting for services to be ready..."
timeout /t 30 /nobreak >nul

:: Check if services are running
docker-compose -f docker-compose.dev.yml ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    call :success "Development environment deployed successfully!"
    call :log "Frontend: http://localhost:5173"
    call :log "Backend: http://localhost:5000"
    call :log "Database: localhost:3306"
) else (
    call :error "Some services failed to start. Check logs with: docker-compose -f docker-compose.dev.yml logs"
    exit /b 1
)
goto :eof

:deploy_prod
call :log "Deploying production environment..."

:: Create backup before deployment
call :create_backup

:: Stop existing containers
docker-compose --profile production down

:: Pull latest images
docker-compose --profile production pull

:: Build and start services
docker-compose --profile production up -d --build

:: Wait for services to be ready
call :log "Waiting for services to be ready..."
timeout /t 60 /nobreak >nul

:: Check if services are running
docker-compose --profile production ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    call :success "Production environment deployed successfully!"
    call :log "Application: http://localhost"
    call :log "API: http://localhost/api"
) else (
    call :error "Some services failed to start. Check logs with: docker-compose --profile production logs"
    exit /b 1
)

:: Run health checks
call :health_check
goto :eof

:health_check
call :log "Running health checks..."

set failed_services=

:: Check frontend
docker-compose ps frontend | findstr "healthy" >nul
if %errorlevel% equ 0 (
    call :success "frontend is healthy"
) else (
    call :warning "frontend health check failed"
    set failed_services=!failed_services! frontend
)

:: Check backend
docker-compose ps backend | findstr "healthy" >nul
if %errorlevel% equ 0 (
    call :success "backend is healthy"
) else (
    call :warning "backend health check failed"
    set failed_services=!failed_services! backend
)

:: Check mysql
docker-compose ps mysql | findstr "healthy" >nul
if %errorlevel% equ 0 (
    call :success "mysql is healthy"
) else (
    call :warning "mysql health check failed"
    set failed_services=!failed_services! mysql
)

if "%failed_services%"=="" (
    call :success "All services are healthy!"
) else (
    call :warning "Some services failed health checks:%failed_services%"
    call :log "Check logs with: docker-compose logs <service_name>"
)
goto :eof

:show_logs
set service=%~1
set env=%~2
set compose_file=docker-compose.yml

if "%env%"=="dev" set compose_file=docker-compose.dev.yml

if not "%service%"=="" (
    docker-compose -f %compose_file% logs -f %service%
) else (
    docker-compose -f %compose_file% logs -f
)
goto :eof

:stop_services
set env=%~1

if "%env%"=="dev" (
    call :log "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
) else (
    call :log "Stopping production services..."
    docker-compose --profile production down
)

call :success "Services stopped"
goto :eof

:cleanup
call :log "Cleaning up..."

:: Remove unused containers
docker container prune -f

:: Remove unused images
docker image prune -f

:: Ask about volumes
set /p remove_volumes="Do you want to remove unused volumes? This will delete data! (y/N): "
if /i "%remove_volumes%"=="y" (
    docker volume prune -f
    call :warning "Unused volumes removed"
)

call :success "Cleanup completed"
goto :eof

:show_status
call :log "Service Status:"
echo.

echo Development Services:
docker-compose -f docker-compose.dev.yml ps
echo.

echo Production Services:
docker-compose --profile production ps
echo.

echo System Resources:
docker system df
goto :eof

:update_app
set env=%~1

call :log "Updating application..."

:: Pull latest code (if using git)
if exist ".git" (
    call :log "Pulling latest code..."
    git pull origin main
)

:: Rebuild and restart services
if "%env%"=="dev" (
    docker-compose -f docker-compose.dev.yml up -d --build
) else (
    call :create_backup
    docker-compose --profile production up -d --build
)

call :success "Application updated"
goto :eof

:show_help
echo Haramaya University Project Store Deployment Script
echo.
echo Usage: %~nx0 [COMMAND] [OPTIONS]
echo.
echo Commands:
echo   dev                 Deploy development environment
echo   prod                Deploy production environment
echo   stop [dev^|prod]     Stop services
echo   logs [service] [dev] Show logs
echo   status              Show service status
echo   health              Run health checks
echo   backup              Create backup
echo   update [dev^|prod]   Update application
echo   cleanup             Clean up unused Docker resources
echo   help                Show this help message
echo.
echo Examples:
echo   %~nx0 dev              # Deploy development environment
echo   %~nx0 prod             # Deploy production environment
echo   %~nx0 logs backend     # Show backend logs
echo   %~nx0 logs backend dev # Show backend logs (dev environment)
echo   %~nx0 stop dev         # Stop development services
echo   %~nx0 update prod      # Update production environment
goto :eof

:main
:: Create log file
type nul > "%LOG_FILE%"

call :log "Starting deployment script for %PROJECT_NAME%"

set command=%~1

if "%command%"=="dev" (
    call :check_docker
    call :deploy_dev
) else if "%command%"=="prod" (
    call :check_docker
    call :check_files
    call :deploy_prod
) else if "%command%"=="stop" (
    call :stop_services %~2
) else if "%command%"=="logs" (
    call :show_logs %~2 %~3
) else if "%command%"=="status" (
    call :show_status
) else if "%command%"=="health" (
    call :health_check
) else if "%command%"=="backup" (
    call :create_backup
) else if "%command%"=="update" (
    call :update_app %~2
) else if "%command%"=="cleanup" (
    call :cleanup
) else if "%command%"=="help" (
    call :show_help
) else if "%command%"=="" (
    call :show_help
) else (
    call :error "Unknown command: %command%. Use '%~nx0 help' for usage information."
    exit /b 1
)

endlocal