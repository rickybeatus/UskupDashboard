# 🔒 PRODUCTION SECURITY GUIDE - Dashboard Uskup Surabaya

## 🚨 CRITICAL SECURITY CHECKLIST

### ✅ **1. Environment Variables (CRITICAL)**
```bash
# Generate strong NextAuth secret
openssl rand -base64 32

# Update .env file
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="https://your-production-domain.com"

# Production database configuration
DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://username:password@localhost:5432/dashboard_uskup?schema=public"
```

### ✅ **2. Database Security**
```sql
-- Create dedicated database user
CREATE USER dashboard_user WITH PASSWORD 'extremely-secure-password';
GRANT ALL PRIVILEGES ON DATABASE dashboard_uskup TO dashboard_user;

-- Revoke public schema access
REVOKE ALL ON SCHEMA public FROM PUBLIC;
```

### ✅ **3. Password Policy (ENFORCED)**
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- No common passwords allowed
- Automatic password strength validation

### ✅ **4. Authentication Security**
- ✅ Bcrypt hashing (12 salt rounds)
- ✅ JWT sessions with proper expiry
- ✅ CSRF protection via NextAuth
- ✅ Rate limiting (implement at reverse proxy)
- ✅ Account lockout after failed attempts

---

## 🗄️ **DATABASE MIGRATION TO POSTGRESQL**

### **Step 1: Install PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Docker
docker run -d --name postgres-dashboard \
  -e POSTGRES_PASSWORD=secure-password \
  -e POSTGRES_DB=dashboard_uskup \
  -p 5432:5432 \
  postgres:15
```

### **Step 2: Create Production Database**
```sql
-- Connect as superuser
sudo -u postgres psql

-- Create database and user
CREATE DATABASE dashboard_uskup;
CREATE USER dashboard_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE dashboard_uskup TO dashboard_user;
\q
```

### **Step 3: Update Environment**
```bash
# Update .env
DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://dashboard_user:your-secure-password@localhost:5432/dashboard_uskup?schema=public"
```

### **Step 4: Migrate Schema**
```bash
# Generate and push schema
npx prisma generate
npx prisma db push

# Run production setup script
psql -h localhost -U dashboard_user -d dashboard_uskup -f sql/production-setup.sql
```

### **Step 5: Seed Data**
```bash
# Seed with secure password
npm run db:seed
```

---

## 🔐 **REVERSE PROXY CONFIGURATION (NGINX)**

### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

    location /auth/signin {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 **MONITORING & LOGGING**

### **Application Monitoring**
```javascript
// Add to next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### **Error Tracking (Optional)**
```bash
# Install Sentry for error monitoring
npm install @sentry/nextjs

# Add to .env
SENTRY_DSN="your-sentry-dsn-here"
```

---

## 🧪 **SECURITY TESTING**

### **Run Security Tests**
```bash
# Run all security tests
npm run test:run

# Run security audit
npm audit

# Check for vulnerabilities
npm run security:check
```

### **Test Security Features**
1. **Password Validation**: Test strong password requirements
2. **Authentication**: Test login/logout flow
3. **Session Security**: Test session expiry and validation
4. **API Security**: Test all API endpoints
5. **CSRF Protection**: Verify NextAuth CSRF protection
6. **Rate Limiting**: Test rate limiting implementation

---

## 🔄 **BACKUP & RECOVERY**

### **Database Backup Script**
```bash
#!/bin/bash
# backup.sh

DB_NAME="dashboard_uskup"
BACKUP_DIR="/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -h localhost -U dashboard_user $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### **Automated Backup (Cron)**
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**
- [ ] Update all environment variables
- [ ] Generate strong NextAuth secret
- [ ] Configure production database
- [ ] Run all security tests
- [ ] Set up monitoring
- [ ] Configure backup system
- [ ] Review all security configurations

### **Post-Deployment**
- [ ] Test all authentication flows
- [ ] Verify all API endpoints
- [ ] Check real-time features
- [ ] Monitor error logs
- [ ] Test backup/restore procedures
- [ ] Review security headers
- [ ] Performance testing

### **Ongoing Maintenance**
- [ ] Regular security updates
- [ ] Monitor failed login attempts
- [ ] Review access logs
- [ ] Update dependencies
- [ ] Test password policies
- [ ] Backup verification
- [ ] Security audits

---

## 🚨 **EMERGENCY PROCEDURES**

### **Compromised Account Response**
1. Immediately disable affected user account
2. Force password reset for all users
3. Review access logs for suspicious activity
4. Reset NextAuth secret
5. Notify users of security incident

### **Database Breach Response**
1. Take database offline immediately
2. Preserve logs for forensic analysis
3. Restore from latest clean backup
4. Update all passwords
5. Review and strengthen security
6. Document incident and response

### **Contact Information**
- Security Team: [security@keuskupan-sby.or.id]
- System Admin: [admin@keuskupan-sby.or.id]
- Emergency Hotline: [emergency-number]

---

**🔒 Remember: Security is an ongoing process, not a one-time setup!**

**Last Updated: 9 November 2025**  
**Version: 1.0**  
**Classification: CONFIDENTIAL**