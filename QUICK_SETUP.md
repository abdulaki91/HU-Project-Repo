# Quick Setup Guide

## Current Status

✅ Environment files configured for local development  
✅ Database connection issues resolved  
✅ Role-based UI features implemented  
⏳ Database needs to be initialized and seeded

## Next Steps

### 1. Database Setup

```bash
cd Backend
npm run setup-local-db
```

This will:

- Create the `projectrepo` database
- Create all required tables (users, projects, comments, ratings, etc.)
- Insert a default super admin user

### 2. Seed Sample Data

```bash
cd Backend
node scripts/seed.js all
```

This will populate the database with:

- 5 sample users (1 super-admin, 2 admins, 2 students)
- 5 sample projects with different statuses
- Sample comments and ratings

### 3. Start the Application

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### 4. Test the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## Sample Login Credentials

### Super Admin

- Email: `admin@haramaya.edu.et`
- Password: `Admin123!`

### Department Admin (CS)

- Email: `ahmed.hassan@haramaya.edu.et`
- Password: `Admin123!`

### Department Admin (IT)

- Email: `sarah.johnson@haramaya.edu.et`
- Password: `Admin123!`

### Students

- Email: `john.doe@haramaya.edu.et` / Password: `Student123!`
- Email: `jane.smith@haramaya.edu.et` / Password: `Student123!`

## Troubleshooting

### Database Connection Issues

If you get "ENOTFOUND mysql" error:

1. Make sure MySQL is running locally
2. Verify credentials in `Backend/.env`
3. Use `localhost` not `mysql` for local development

### Frontend API Errors

If you get CORS errors:

1. Check `Frontend/.env` has `VITE_API_URL=http://localhost:5000/api`
2. Ensure backend is running on port 5000
3. Clear browser cache and restart both servers

### Migration Errors

If seeding fails:

1. Run `node scripts/migrate.js status` to check migrations
2. Run `node scripts/migrate.js up` to apply pending migrations
3. Then retry seeding with `node scripts/seed.js all`
