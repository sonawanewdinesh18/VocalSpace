# 🚀 VocalSpace - Production Deployment Guide

Complete guide for deploying VocalSpace to production.

## 📋 Pre-Deployment Checklist

- [ ] Change default admin password
- [ ] Generate strong SECRET_KEY
- [ ] Setup production database
- [ ] Configure environment variables
- [ ] Setup SSL certificates
- [ ] Configure CORS origins
- [ ] Setup file storage (cloud)
- [ ] Configure monitoring
- [ ] Setup backup strategy
- [ ] Test all features
- [ ] Load testing
- [ ] Security audit

## 🔐 Security Hardening

### 1. Environment Variables

**Backend (.env)**
```env
# CRITICAL: Change these!
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DATABASE_URL=postgresql://user:password@host:5432/vocalspace

# Production settings
ENVIRONMENT=production
DEBUG=False

# CORS - Add your domain
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File storage
UPLOAD_DIR=/var/www/vocalspace/uploads
```

**Frontend (.env.production)**
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_GOOGLE_CLIENT_ID=your_production_client_id
```

### 2. Generate Secure Keys

```bash
# SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or using OpenSSL
openssl rand -hex 32
```

### 3. Database Security

```sql
-- Create production user with limited privileges
CREATE USER vocalspace_prod WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE vocalspace TO vocalspace_prod;
GRANT USAGE ON SCHEMA public TO vocalspace_prod;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vocalspace_prod;
```

## 🗄️ Database Setup

### PostgreSQL (Production)

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb vocalspace

# Create user
sudo -u postgres psql
CREATE USER vocalspace_prod WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vocalspace TO vocalspace_prod;
\q

# Run migrations
cd backend
python -m app.db.init_db
```

### Database Backup

```bash
# Automated daily backup
crontab -e

# Add this line (backup at 2 AM daily)
0 2 * * * pg_dump -U vocalspace_prod vocalspace > /backups/vocalspace_$(date +\%Y\%m\%d).sql
```

## 🐳 Docker Deployment

### 1. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create upload directories
RUN mkdir -p uploads/audio uploads/profiles

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### 2. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production image
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: vocalspace
      POSTGRES_USER: vocalspace_prod
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://vocalspace_prod:${DB_PASSWORD}@db:5432/vocalspace
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: production
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

### 4. Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## ☁️ Cloud Deployment Options

### Option 1: AWS

#### Backend (EC2 + RDS)

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Install dependencies
sudo apt-get update
sudo apt-get install python3.10 python3-pip postgresql-client ffmpeg

# 3. Clone repository
git clone https://github.com/yourusername/vocalspace.git
cd vocalspace/backend

# 4. Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 5. Configure environment
cp .env.example .env
nano .env  # Edit with production values

# 6. Install Gunicorn
pip install gunicorn

# 7. Create systemd service
sudo nano /etc/systemd/system/vocalspace.service
```

**vocalspace.service:**
```ini
[Unit]
Description=VocalSpace API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/vocalspace/backend
Environment="PATH=/home/ubuntu/vocalspace/backend/venv/bin"
ExecStart=/home/ubuntu/vocalspace/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start vocalspace
sudo systemctl enable vocalspace
```

#### Frontend (S3 + CloudFront)

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# 3. Configure CloudFront
# - Create distribution
# - Point to S3 bucket
# - Setup SSL certificate
# - Configure custom domain
```

#### Database (RDS)

```bash
# 1. Create RDS PostgreSQL instance
# 2. Configure security groups
# 3. Update DATABASE_URL in backend .env
# 4. Run migrations
```

### Option 2: Heroku

#### Backend

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create vocalspace-api

# 4. Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# 5. Set environment variables
heroku config:set SECRET_KEY=your_secret_key
heroku config:set ENVIRONMENT=production

# 6. Create Procfile
echo "web: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker" > Procfile

# 7. Deploy
git push heroku main

# 8. Initialize database
heroku run python -m app.db.init_db
```

#### Frontend

```bash
# Deploy to Vercel or Netlify (see below)
```

### Option 3: Vercel (Frontend)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel --prod

# 3. Configure environment variables in Vercel dashboard
```

### Option 4: Netlify (Frontend)

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist
```

### Option 5: DigitalOcean

#### App Platform

```yaml
# .do/app.yaml
name: vocalspace
services:
  - name: backend
    github:
      repo: yourusername/vocalspace
      branch: main
      deploy_on_push: true
    source_dir: /backend
    build_command: pip install -r requirements.txt
    run_command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: SECRET_KEY
        value: ${SECRET_KEY}
    
  - name: frontend
    github:
      repo: yourusername/vocalspace
      branch: main
    source_dir: /frontend
    build_command: npm run build
    output_dir: dist

databases:
  - name: db
    engine: PG
    version: "14"
```

## 🌐 Nginx Configuration

```nginx
# /etc/nginx/sites-available/vocalspace

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File upload size
    client_max_body_size 50M;
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/vocalspace/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```bash
# Install Sentry (Error tracking)
pip install sentry-sdk

# Add to backend/app/main.py
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")
```

### 2. Server Monitoring

```bash
# Install monitoring tools
sudo apt-get install htop iotop nethogs

# Setup log rotation
sudo nano /etc/logrotate.d/vocalspace
```

### 3. Database Monitoring

```bash
# PostgreSQL slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000;
SELECT pg_reload_conf();
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/vocalspace
            git pull
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart vocalspace

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and deploy
        run: |
          cd frontend
          npm install
          npm run build
          # Deploy to S3/Vercel/Netlify
```

## 📈 Performance Optimization

### Backend

```python
# Add caching (Redis)
pip install redis

# app/core/cache.py
import redis
cache = redis.Redis(host='localhost', port=6379, db=0)
```

### Frontend

```javascript
// Code splitting
const Dashboard = lazy(() => import('./pages/user/Dashboard'))

// Image optimization
// Use WebP format
// Lazy load images
```

### Database

```sql
-- Add indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_session_user ON practice_sessions(user_id);
CREATE INDEX idx_session_date ON practice_sessions(created_at);
```

## 🔧 Maintenance

### Regular Tasks

```bash
# Weekly database backup
pg_dump vocalspace > backup_$(date +%Y%m%d).sql

# Monthly dependency updates
pip list --outdated
npm outdated

# Log cleanup
find /var/log -name "*.log" -mtime +30 -delete

# Disk space check
df -h
```

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Database health
psql -U vocalspace_prod -d vocalspace -c "SELECT 1"

# Frontend health
curl -I https://yourdomain.com
```

## 🚨 Troubleshooting

### Common Issues

**502 Bad Gateway**
```bash
# Check backend is running
sudo systemctl status vocalspace

# Check logs
sudo journalctl -u vocalspace -f
```

**Database Connection Error**
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Test connection
psql -U vocalspace_prod -d vocalspace
```

**High Memory Usage**
```bash
# Check processes
htop

# Restart services
sudo systemctl restart vocalspace
```

## 📝 Post-Deployment

- [ ] Test all features
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Setup alerts
- [ ] Document any issues
- [ ] Update team
- [ ] Monitor user feedback

## 🎉 Success!

Your VocalSpace platform is now live in production! 🚀

Remember to:
- Monitor regularly
- Keep dependencies updated
- Backup database daily
- Review security logs
- Scale as needed

---

**Need help?** Check the troubleshooting section or review logs for errors.
