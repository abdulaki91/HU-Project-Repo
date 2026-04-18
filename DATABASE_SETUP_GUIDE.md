# Database Setup Guide

This guide covers setting up the MySQL database for the Haramaya University Project Store (HUPS) application.

## Overview

The application uses MySQL 8.0 as the primary database with the following components:

- **Database Name**: `projectrepo`
- **Tables**: `users`, `projects`
- **Default Character Set**: `utf8mb4`
- **Default Collation**: `utf8mb4_unicode_ci`

## Prerequisites

### Local Development

- MySQL 8.0+ installed and running
- Node.js 18+ and npm
- Git (for cloning the repository)

### Docker Development

- Docker and Docker Compose installed
- No local MySQL installation required

## Setup Methods

### Method 1: Remote MySQL via SSH Tunnel

This method connects to a remote MySQL server through an SSH tunnel, which is secure and allows you to access a database on a remote server as if it were local.

#### Step 1: Establish SSH Tunnel

Before starting the application, you need to create an SSH tunnel to forward the remote MySQL port to your local machine:

```bash
# Create SSH tunnel (keep this terminal open)
ssh -L 3307:localhost:3306 -p 1219 abdulaki@abdulaki.com
```

**Explanation:**

- `-L 3307:localhost:3306` - Forward local port 3307 to remote port 3306
- `-p 1219` - SSH server port
- `abdulaki@abdulaki.com` - SSH username and server

#### Step 2: Configure Environment Variables

Update `Backend/.env` with your SSH tunnel configuration:

```env
# MySQL Database Configuration (Remote via SSH Tunnel)
DB_HOST=localhost
DB_USER=abdulaki_abdulaki
DB_NAME=abdulaki_student_results
DB_PORT=3307
DB_PASS="Alhamdulillaah##91"
```

#### Step 3: Test Connection

```bash
cd Backend
npm install
node scripts/test-connection.js
```

#### Step 4: Initialize Database (if needed)

If the remote database needs initialization:

```bash
npm run setup-enhanced-db
```

**Important Notes:**

- Keep the SSH tunnel terminal open while running the application
- The tunnel will close if the SSH connection drops
- Consider using `autossh` for automatic reconnection in production

#### SSH Tunnel Management

**Keep tunnel alive with autossh:**

```bash
# Install autossh (macOS)
brew install autossh

# Install autossh (Ubuntu/Debian)
sudo apt install autossh

# Use autossh for automatic reconnection
autossh -M 20000 -L 3307:localhost:3306 -p 1219 abdulaki@abdulaki.com
```

**Background tunnel (using screen/tmux):**

```bash
# Using screen
screen -S mysql-tunnel
ssh -L 3307:localhost:3306 -p 1219 abdulaki@abdulaki.com
# Press Ctrl+A, then D to detach

# Using tmux
tmux new-session -d -s mysql-tunnel 'ssh -L 3307:localhost:3306 -p 1219 abdulaki@abdulaki.com'
```

**Verify tunnel is working:**

```bash
# Check if port is listening
netstat -an | grep 3307
# or
lsof -i :3307

# Test MySQL connection through tunnel
mysql -h localhost -P 3307 -u abdulaki_abdulaki -p abdulaki_student_results
```

### Method 2: Local MySQL Setup (Alternative)

#### Step 1: Install MySQL

**Windows (XAMPP/WAMP):**

```bash
# Download and install XAMPP from https://www.apachefriends.org/
# Start MySQL service from XAMPP Control Panel
```

**macOS (Homebrew):**

```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Step 2: Configure Environment Variables

1. Copy the environment template:

```bash
cp Backend/.env.example Backend/.env
```

2. Update database configuration in `Backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=your_database_password
DB_NAME=projectrepo
DB_PORT=3306
DB_ROOT_PASSWORD=your_root_password
```

#### Step 3: Run Database Setup

Choose one of the following setup scripts:

**Option A: Quick Local Setup (Recommended)**

```bash
cd Backend
npm install
npm run setup-local-db
```

**Option B: Enhanced Setup with Status Checking**

```bash
cd Backend
npm run setup-enhanced-db
```

**Option C: Manual Setup**

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE projectrepo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run initialization script
mysql -u root -p projectrepo < Backend/scripts/init.sql
```

#### Step 4: Verify Setup

```bash
cd Backend
npm run setup-enhanced-db --status
```

### Method 3: Docker Setup

#### Step 1: Environment Configuration

1. Copy environment files:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

2. Update `Backend/.env` for Docker:

```env
DB_HOST=mysql
DB_USER=hups_user
DB_PASS=hups_password
DB_NAME=projectrepo
DB_PORT=3306
```

#### Step 2: Start Services

**Development Environment:**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Production Environment:**

```bash
docker-compose up -d
```

#### Step 3: Verify Docker Setup

```bash
# Check running containers
docker-compose ps

# Check database logs
docker-compose logs mysql

# Connect to database container
docker exec -it hups_mysql mysql -u root -p
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  batch VARCHAR(50) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  verificationToken VARCHAR(255) DEFAULT NULL,
  resetToken VARCHAR(255) DEFAULT NULL,
  resetTokenExpiry DATETIME DEFAULT NULL,
  role ENUM('admin','student','super-admin') NOT NULL DEFAULT 'student',
  verified BOOLEAN DEFAULT FALSE,
  lastLogin DATETIME DEFAULT NULL,
  profilePicture VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  status ENUM('active','suspended','inactive') DEFAULT 'active',
  emailPreferences JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Projects Table

```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course VARCHAR(100),
  department VARCHAR(100),
  author_name VARCHAR(255),
  batch VARCHAR(50),
  tags JSON,
  author_id INT NOT NULL,
  file_path VARCHAR(255),
  file_size BIGINT DEFAULT NULL,
  file_type VARCHAR(100) DEFAULT NULL,
  downloads INT DEFAULT 0,
  status ENUM('pending', 'approved','rejected') DEFAULT 'pending',
  rejectionReason TEXT DEFAULT NULL,
  views INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_author FOREIGN KEY (author_id)
    REFERENCES users(id) ON DELETE CASCADE
);
```

## Default Data

### Super Admin User

The setup automatically creates a default super admin account:

- **Email**: `admin@haramaya.edu.et`
- **Password**: `admin123`
- **Role**: `super-admin`

**Important**: Change this password immediately in production!

## Available NPM Scripts

```bash
# SSH Tunnel Management (for remote database)
npm run tunnel:start         # Start SSH tunnel
npm run tunnel:stop          # Stop SSH tunnel
npm run tunnel:status        # Check tunnel status and test connection
npm run tunnel:restart       # Restart SSH tunnel

# Database setup and management
npm run setup-db              # Basic database setup
npm run setup-local-db        # Local development setup
npm run setup-enhanced-db     # Enhanced setup with status checking
npm run migrate               # Run database migrations
npm run seed                  # Seed sample data

# Development
npm run dev                   # Start development server
npm run start                 # Start production server

# Testing
npm run test                  # Run tests
npm run test:coverage         # Run tests with coverage
```

## Troubleshooting

### SSH Tunnel Issues

#### SSH Connection Refused

```bash
ssh: connect to host abdulaki.com port 1219: Connection refused
```

**Solutions:**

1. Verify the SSH server is running on the remote host
2. Check if port 1219 is correct
3. Ensure firewall allows SSH connections
4. Try connecting without tunnel first: `ssh -p 1219 abdulaki@abdulaki.com`

#### Tunnel Port Already in Use

```bash
bind [127.0.0.1]:3307: Address already in use
```

**Solutions:**

1. Kill existing process using port 3307:

```bash
# Find process using port 3307
lsof -ti:3307
# Kill the process
kill -9 $(lsof -ti:3307)
```

2. Use a different local port:

```bash
ssh -L 3308:localhost:3306 -p 1219 abdulaki@abdulaki.com
# Update DB_PORT=3308 in .env
```

#### Authentication Failed

```bash
Permission denied (publickey,password)
```

**Solutions:**

1. Verify username and password
2. Check if SSH key authentication is required
3. Add your SSH key to the remote server:

```bash
ssh-copy-id -p 1219 abdulaki@abdulaki.com
```

#### Database Connection Through Tunnel Fails

```bash
Error: connect ECONNREFUSED 127.0.0.1:3307
```

**Solutions:**

1. Verify SSH tunnel is active: `netstat -an | grep 3307`
2. Check if MySQL is running on remote server
3. Verify database credentials
4. Test direct connection to remote MySQL (if allowed):

```bash
mysql -h abdulaki.com -P 3306 -u abdulaki_abdulaki -p
```

#### Tunnel Keeps Disconnecting

**Solutions:**

1. Use `autossh` for automatic reconnection
2. Add keep-alive settings to SSH config (`~/.ssh/config`):

```
Host abdulaki.com
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

3. Use `screen` or `tmux` to run tunnel in background

### Common Issues

#### Connection Refused

```bash
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solutions:**

1. Ensure MySQL server is running
2. Check if MySQL is listening on port 3306: `netstat -an | grep 3306`
3. Verify firewall settings
4. For XAMPP/WAMP: Start MySQL service from control panel

#### Access Denied

```bash
Error: Access denied for user 'root'@'localhost'
```

**Solutions:**

1. Verify username and password in `.env` file
2. Reset MySQL root password if needed
3. Check user privileges: `GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';`

#### Database Does Not Exist

```bash
Error: Unknown database 'projectrepo'
```

**Solutions:**

1. Run setup script: `npm run setup-local-db`
2. Manually create database: `CREATE DATABASE projectrepo;`

#### Character Set Issues

```bash
Error: Incorrect string value
```

**Solutions:**

1. Ensure database uses `utf8mb4` character set
2. Recreate database with proper charset:

```sql
DROP DATABASE IF EXISTS projectrepo;
CREATE DATABASE projectrepo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Docker-Specific Issues

#### Container Won't Start

```bash
# Check container logs
docker-compose logs mysql

# Restart containers
docker-compose down
docker-compose up -d
```

#### Port Already in Use

```bash
Error: Port 3306 is already allocated
```

**Solutions:**

1. Stop local MySQL: `brew services stop mysql` (macOS) or `sudo service mysql stop` (Linux)
2. Change port in `docker-compose.yml`: `"3307:3306"`
3. Update `DB_PORT` in `.env` accordingly

#### Volume Permission Issues

```bash
# Fix volume permissions
docker-compose down
docker volume rm $(docker volume ls -q)
docker-compose up -d
```

## Performance Optimization

### Indexes

The setup includes optimized indexes for:

- User lookups by email, role, department
- Project searches by status, department, course
- Full-text search on project titles and descriptions

### Connection Pooling

The application uses MySQL2 connection pooling:

```javascript
const dbConfig = {
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
};
```

## Security Considerations

### Production Setup

1. **Change default passwords**:
   - Super admin password
   - Database root password
   - Database user password

2. **Create dedicated database user**:

```sql
CREATE USER 'hups_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON projectrepo.* TO 'hups_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Enable SSL connections**:

```env
DB_SSL=true
DB_SSL_CA=/path/to/ca-cert.pem
```

4. **Regular backups**:

```bash
# Create backup
mysqldump -u root -p projectrepo > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u root -p projectrepo < backup_file.sql
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check database status
npm run setup-enhanced-db --status

# Test connection
node Backend/scripts/test-connection.js
```

### Log Monitoring

```bash
# Application logs
tail -f Backend/logs/error.log

# MySQL logs (varies by system)
tail -f /var/log/mysql/error.log
```

### Regular Maintenance

```sql
-- Optimize tables
OPTIMIZE TABLE users, projects;

-- Check table status
SHOW TABLE STATUS;

-- Analyze query performance
EXPLAIN SELECT * FROM projects WHERE status = 'approved';
```

## Migration and Upgrades

### Database Migrations

Future schema changes should be handled through migration scripts:

```bash
# Run pending migrations
npm run migrate

# Create new migration
node Backend/scripts/create-migration.js add_new_column
```

### Backup Before Upgrades

```bash
# Full backup
mysqldump -u root -p --all-databases > full_backup.sql

# Schema only
mysqldump -u root -p --no-data projectrepo > schema_backup.sql

# Data only
mysqldump -u root -p --no-create-info projectrepo > data_backup.sql
```

## Support

For additional help:

1. Check the application logs in `Backend/logs/`
2. Review MySQL error logs
3. Verify environment configuration
4. Test database connectivity with `Backend/scripts/test-connection.js`

---

**Next Steps**: After successful database setup, proceed to start the backend server with `npm run dev` and configure the frontend application.
