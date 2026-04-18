# UPSHU Project Store Deployment Guide

## 🌐 **Production URLs**

- **Frontend**: https://huprojectstore.abdulaki.com
- **Backend**: https://huprojectrepo-backend.abdulaki.com

## 🚀 **Deployment Architecture**

```
┌─────────────────────────────────────────┐
│           Production Setup              │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (Static Files)               │
│  └── huprojectstore.abdulaki.com       │
│      ├── React SPA Build               │
│      ├── Modern UPSHU Logo             │
│      └── Responsive Design             │
│                                         │
│  Backend (Node.js API)                 │
│  └── huprojectrepo-backend.abdulaki.com│
│      ├── Express.js Server             │
│      ├── JWT Authentication            │
│      ├── File Upload Handling          │
│      └── MySQL Database Connection     │
│                                         │
│  Database (Remote MySQL)               │
│  └── abdulaki.com:3306                 │
│      ├── SSH Tunnel Access             │
│      ├── Users & Projects Tables       │
│      └── Secure Connection             │
│                                         │
└─────────────────────────────────────────┘
```

## 📋 **Frontend Deployment Steps**

### **Step 1: Build for Production**

```bash
cd Frontend
npm install
npm run build
```

### **Step 2: Upload to cPanel**

1. **Access cPanel File Manager**
2. **Navigate to public_html** (for main domain)
3. **Upload dist folder contents**:
   - `index.html`
   - `assets/` folder (CSS, JS, images)
   - Any other static files

### **Step 3: Configure Domain**

- Ensure `huprojectstore.abdulaki.com` points to the uploaded files
- Set up SSL certificate for HTTPS

## 🔧 **Backend Deployment Steps**

### **Step 1: Server Setup**

```bash
# On your backend server
cd /path/to/backend
git pull origin main
npm install
```

### **Step 2: Environment Configuration**

Update `.env` file on backend server:

```env
NODE_ENV=production
DB_HOST=localhost
DB_USER=abdulaki_abdulaki
DB_NAME=abdulaki_haramaya_project_repo
DB_PORT=3307
DB_PASS="Alhamdulillaah##91"
BACKEND_URL=https://huprojectrepo-backend.abdulaki.com
CLIENT_URL=https://huprojectstore.abdulaki.com
ALLOWED_ORIGINS=https://huprojectstore.abdulaki.com
```

### **Step 3: Start Services**

```bash
# Start SSH tunnel for database
ssh -L 3307:localhost:3306 -p 1219 abdulaki@abdulaki.com

# Start backend server
npm start
# or with PM2 for production
pm2 start index.js --name "huprojectrepo-backend"
```

## 🔒 **Security Configuration**

### **CORS Settings**

Backend allows requests from:

- `https://huprojectstore.abdulaki.com` (production)
- `http://localhost:5173` (development)

### **SSL/HTTPS**

- ✅ Frontend: HTTPS enabled
- ✅ Backend: HTTPS enabled
- ✅ Database: SSH tunnel encryption

### **Environment Variables**

- ✅ JWT secrets configured
- ✅ Database credentials secured
- ✅ File upload limits set

## 📊 **Features Deployed**

### **Frontend Features**

- ✅ Modern UPSHU Logo with animations
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light theme support
- ✅ Project browsing and search
- ✅ User authentication
- ✅ File upload interface
- ✅ Admin dashboard

### **Backend Features**

- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ File upload handling
- ✅ Database operations
- ✅ User management
- ✅ Project management
- ✅ Admin controls

## 🛠 **Maintenance Commands**

### **Update Frontend**

```bash
# Local development
git pull origin main
cd Frontend
npm install
npm run build

# Upload new dist/ contents to cPanel
```

### **Update Backend**

```bash
# On backend server
git pull origin main
npm install
pm2 restart huprojectrepo-backend
```

### **Database Maintenance**

```bash
# Check database status
npm run setup-enhanced-db --status

# Backup database
mysqldump -u abdulaki_abdulaki -p abdulaki_haramaya_project_repo > backup.sql
```

## 🔍 **Monitoring & Logs**

### **Frontend Monitoring**

- Check browser console for errors
- Monitor network requests to backend
- Verify HTTPS certificate status

### **Backend Monitoring**

```bash
# Check server status
pm2 status

# View logs
pm2 logs huprojectrepo-backend

# Monitor resources
pm2 monit
```

### **Database Monitoring**

```bash
# Test SSH tunnel
npm run tunnel:status

# Check database connection
node Backend/scripts/test-connection.js
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **CORS Errors**

- Verify `ALLOWED_ORIGINS` includes frontend domain
- Check HTTPS/HTTP protocol matching

#### **Database Connection**

- Ensure SSH tunnel is active
- Verify database credentials
- Check firewall settings

#### **File Upload Issues**

- Check `MAX_FILE_SIZE` settings
- Verify upload directory permissions
- Monitor disk space

### **Quick Fixes**

```bash
# Restart backend
pm2 restart huprojectrepo-backend

# Restart SSH tunnel
npm run tunnel:restart

# Clear browser cache
# Ctrl+Shift+R (hard refresh)
```

## 📞 **Support Information**

### **URLs to Monitor**

- Frontend: https://huprojectstore.abdulaki.com
- Backend: https://huprojectrepo-backend.abdulaki.com/health
- API Status: https://huprojectrepo-backend.abdulaki.com/api/health

### **Key Metrics**

- Response time < 2 seconds
- Uptime > 99.5%
- SSL certificate valid
- Database connection stable

---

**Last Updated**: April 18, 2026
**Version**: 1.0.0
**Deployment Status**: ✅ Production Ready
