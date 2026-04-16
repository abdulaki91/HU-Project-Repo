@echo off
echo ========================================
echo Haramaya University Project Store Setup
echo ========================================
echo.

echo [1/4] Setting up database...
cd Backend
call npm run setup-local-db
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed!
    echo Please check if MySQL is running and try again.
    pause
    exit /b 1
)

echo.
echo [2/4] Running database migrations...
call node scripts/migrate.js up
if %errorlevel% neq 0 (
    echo ERROR: Database migrations failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Seeding sample data...
call node scripts/seed.js all
if %errorlevel% neq 0 (
    echo ERROR: Database seeding failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Installing dependencies...
call npm install
cd ..\Frontend
call npm install

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Sample Login Credentials:
echo Super Admin: admin@haramaya.edu.et / Admin123!
echo CS Admin: ahmed.hassan@haramaya.edu.et / Admin123!
echo IT Admin: sarah.johnson@haramaya.edu.et / Admin123!
echo Student: john.doe@haramaya.edu.et / Student123!
echo Student: jane.smith@haramaya.edu.et / Student123!
echo.
echo To start the application:
echo 1. Backend: cd Backend && npm run dev
echo 2. Frontend: cd Frontend && npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo.
pause