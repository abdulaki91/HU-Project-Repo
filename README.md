# Haramaya University Project Store

A comprehensive web application for managing and sharing academic projects at Haramaya University. This system allows students to upload their projects, administrators to review and approve them, and provides a centralized repository for academic work.

## 🚀 Features

### For Students
- **Project Upload**: Upload projects with detailed metadata (title, description, course, department, etc.)
- **File Management**: Support for multiple file formats (ZIP, PDF, DOC, DOCX, PPT, PPTX)
- **Project Tracking**: View status of uploaded projects (pending, approved, rejected)
- **Browse Projects**: Explore approved projects from all departments
- **Download Projects**: Access approved project files
- **Profile Management**: Update personal information and change passwords

### For Administrators
- **Department Management**: Review projects from their specific department
- **Approval Workflow**: Approve or reject pending projects with reasons
- **Analytics Dashboard**: View statistics and trends
- **User Management**: Manage student accounts and permissions

### For Super Administrators
- **System Overview**: Global statistics and analytics
- **User Administration**: Manage all users and administrators
- **System Configuration**: Configure system-wide settings

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, XSS protection, Rate limiting
- **Email**: Nodemailer
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand, React Query
- **Routing**: React Router v7
- **UI Components**: Radix UI, Flowbite React
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Notifications**: React Toastify

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **Database**: MySQL with persistent volumes
- **Caching**: Redis (optional)
- **Monitoring**: Health checks and logging

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm 8.0 or higher
- MySQL 8.0 or higher
- Docker & Docker Compose (for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/haramaya-project-store.git
cd haramaya-project-store
```

### 2. Environment Setup

#### Backend Environment
```bash
cd Backend
cp .env.example .env
# Edit .env with your configuration
```

#### Frontend Environment
```bash
cd Frontend
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start MySQL with Docker Compose
docker-compose up mysql -d

# Wait for MySQL to be ready, then run initialization
npm run setup-db
```

#### Option B: Local MySQL
```bash
# Create database
mysql -u root -p
CREATE DATABASE projectrepo;
exit

# Run initialization script
cd Backend
npm run setup-db
```

### 4. Install Dependencies

#### Backend
```bash
cd Backend
npm install
```

#### Frontend
```bash
cd Frontend
npm install
```

### 5. Start Development Servers

#### Backend
```bash
cd Backend
npm run dev
```

#### Frontend
```bash
cd Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api

## 🐳 Docker Deployment

### Development Environment
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start specific services
docker-compose -f docker-compose.dev.yml up mysql redis
```

### Production Environment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

### Backend Tests
```bash
cd Backend
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

### Frontend Tests
```bash
cd Frontend
npm test                # Run all tests
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage
```

## 📁 Project Structure

```
haramaya-project-store/
├── Backend/
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   ├── tests/             # Test files
│   ├── scripts/           # Database scripts
│   ├── uploads/           # File uploads
│   └── logs/              # Application logs
├── Frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # React context
│   │   ├── utils/         # Utility functions
│   │   └── api/           # API client
│   ├── public/            # Static assets
│   └── dist/              # Build output
├── nginx/                 # Nginx configuration
├── docker-compose.yml     # Production compose
├── docker-compose.dev.yml # Development compose
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=projectrepo
DB_PORT=3306

# Server
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=24h

# Email
EMAIL_USERNAME=your_email@domain.com
EMAIL_PASSWORD=your_app_password

# URLs
BACKEND_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=3221225472  # 3GB in bytes
```

#### Frontend (.env)
```env
# API
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Haramaya University Project Store

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false

# File Upload
VITE_MAX_FILE_SIZE=52428800  # 50MB in bytes
VITE_ALLOWED_FILE_TYPES=.zip,.pdf,.doc,.docx,.ppt,.pptx
```

## 🔐 Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control (Student, Admin, Super Admin)
- **Input Validation**: Comprehensive validation using Joi
- **XSS Protection**: Input sanitization and output encoding
- **SQL Injection Prevention**: Parameterized queries
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Upload Security**: File type and size validation
- **HTTPS**: SSL/TLS encryption in production
- **Security Headers**: Helmet.js for security headers
- **Password Security**: Bcrypt hashing with salt rounds

## 📊 API Documentation

### Authentication Endpoints
```
POST /api/user/register     # User registration
POST /api/user/login        # User login
POST /api/user/logout       # User logout
GET  /api/user/me           # Get current user
PUT  /api/user/update/:id   # Update user profile
```

### Project Endpoints
```
GET  /api/project/browse-approved    # Browse approved projects
GET  /api/project/my-projects        # Get user's projects
POST /api/project/upload             # Upload new project
GET  /api/project/view/:id           # View project details
GET  /api/project/download/:id       # Download project file
PUT  /api/project/edit/:id           # Edit project
DELETE /api/project/delete/:id       # Delete project
```

### Admin Endpoints
```
GET  /api/project/admin/pending-projects  # Get pending projects
PUT  /api/project/admin/approve/:id       # Approve project
PUT  /api/project/admin/reject/:id        # Reject project
GET  /api/project/dashboard/stats         # Get dashboard statistics
```

## 🚀 Deployment Guide

### Production Deployment with Docker

1. **Prepare Environment**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/haramaya-project-store.git
   cd haramaya-project-store
   
   # Set up environment variables
   cp Backend/.env.example Backend/.env
   cp Frontend/.env.example Frontend/.env
   # Edit both .env files with production values
   ```

2. **Configure Domain and SSL**
   ```bash
   # Update nginx/nginx.conf with your domain
   # Set up SSL certificates (Let's Encrypt recommended)
   ```

3. **Deploy**
   ```bash
   # Build and start services
   docker-compose up -d
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   ```

4. **Initialize Database**
   ```bash
   # Run database initialization
   docker-compose exec backend npm run setup-db
   ```

### Manual Deployment

1. **Server Setup**
   - Ubuntu 20.04+ or CentOS 8+
   - Node.js 18+, MySQL 8.0+, Nginx
   - SSL certificate (Let's Encrypt)

2. **Application Deployment**
   ```bash
   # Backend
   cd Backend
   npm ci --production
   npm run build
   pm2 start index.js --name "hups-backend"
   
   # Frontend
   cd Frontend
   npm ci
   npm run build
   # Copy dist/ to nginx web root
   ```

3. **Database Setup**
   ```bash
   mysql -u root -p < Backend/scripts/init.sql
   ```

4. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           root /var/www/html;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🔍 Monitoring and Maintenance

### Health Checks
- Backend: `GET /health`
- Database connectivity monitoring
- File system space monitoring
- Memory and CPU usage tracking

### Logging
- Application logs: `Backend/logs/`
- Error logs: `Backend/logs/error.log`
- Access logs: Nginx access logs
- Docker logs: `docker-compose logs`

### Backup Strategy
```bash
# Database backup
mysqldump -u root -p projectrepo > backup_$(date +%Y%m%d).sql

# File uploads backup
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz Backend/uploads/

# Automated backup script
0 2 * * * /path/to/backup-script.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

## 🙏 Acknowledgments

- Haramaya University for project requirements
- Open source community for tools and libraries
- Contributors and testers

---

**Made with ❤️ for Haramaya University**