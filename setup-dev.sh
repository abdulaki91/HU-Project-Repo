#!/bin/bash

echo "========================================"
echo "Haramaya University Project Store Setup"
echo "========================================"
echo

echo "[1/4] Setting up database..."
cd Backend
npm run setup-local-db
if [ $? -ne 0 ]; then
    echo "ERROR: Database setup failed!"
    echo "Please check if MySQL is running and try again."
    exit 1
fi

echo
echo "[2/4] Running database migrations..."
node scripts/migrate.js up
if [ $? -ne 0 ]; then
    echo "ERROR: Database migrations failed!"
    exit 1
fi

echo
echo "[3/4] Seeding sample data..."
node scripts/seed.js all
if [ $? -ne 0 ]; then
    echo "ERROR: Database seeding failed!"
    exit 1
fi

echo
echo "[4/4] Installing dependencies..."
npm install
cd ../Frontend
npm install

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "Sample Login Credentials:"
echo "Super Admin: admin@haramaya.edu.et / Admin123!"
echo "CS Admin: ahmed.hassan@haramaya.edu.et / Admin123!"
echo "IT Admin: sarah.johnson@haramaya.edu.et / Admin123!"
echo "Student: john.doe@haramaya.edu.et / Student123!"
echo "Student: jane.smith@haramaya.edu.et / Student123!"
echo
echo "To start the application:"
echo "1. Backend: cd Backend && npm run dev"
echo "2. Frontend: cd Frontend && npm run dev"
echo
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000/api"
echo