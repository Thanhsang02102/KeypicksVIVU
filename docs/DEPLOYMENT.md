# 🚢 Deployment Guide - KeypicksVIVU

Hướng dẫn deploy ứng dụng lên các nền tảng cloud phổ biến.

## 📋 Prerequisites

- Docker và Docker Compose đã được cài đặt
- Account trên cloud platform bạn chọn
- Domain name (optional, nhưng khuyến nghị)
- SSL certificate (Let's Encrypt hoặc từ cloud provider)

---

## 🌐 Deploy to VPS (DigitalOcean, AWS EC2, Azure VM, etc.)

### 1. Chuẩn bị VPS

```bash
# SSH vào server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone và Setup

```bash
# Clone repository
git clone <your-repo-url>
cd KeypicksVIVU

# Tạo .env file
nano .env
```

Thêm nội dung vào `.env`:
```env
NODE_ENV=production
PORT=3000
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-strong-password-here-change-this
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
JWT_EXPIRE=7d
```

### 3. Deploy

```bash
# Build và start
docker-compose -f docker-compose.prod.yml up -d

# Kiểm tra status
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Setup Nginx Reverse Proxy (Optional)

```bash
# Install Nginx
apt install nginx -y

# Tạo config
nano /etc/nginx/sites-available/keypicksvivu
```

Nội dung file config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/keypicksvivu /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 5. Setup SSL với Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Obtain certificate
certbot --nginx -d your-domain.com

# Auto-renewal test
certbot renew --dry-run
```

---

## 🐳 Deploy to Docker Cloud Platforms

### Deploy to DigitalOcean App Platform

1. Đẩy code lên GitHub
2. Vào DigitalOcean App Platform
3. Create New App → From GitHub
4. Chọn repository
5. Configure:
   - **Dockerfile Path**: `Dockerfile`
   - **HTTP Port**: `3000`
6. Add Database Component → MongoDB
7. Set Environment Variables từ `.env`
8. Deploy!

### Deploy to Heroku

```bash
# Install Heroku CLI
# Windows: https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create keypicksvivu

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set JWT_EXPIRE=7d

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy to Railway

1. Vào https://railway.app/
2. New Project → Deploy from GitHub
3. Chọn repository
4. Railway sẽ tự động detect Dockerfile
5. Add MongoDB từ Railway Plugin
6. Set Environment Variables
7. Deploy!

### Deploy to Render

1. Vào https://render.com/
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Environment**: Docker
   - **Dockerfile Path**: `Dockerfile`
   - **Port**: `3000`
5. Add MongoDB từ Render
6. Set Environment Variables
7. Create Web Service

---

## ☸️ Deploy to Kubernetes

### 1. Tạo Kubernetes manifests

Create `k8s/deployment.yml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keypicksvivu
spec:
  replicas: 3
  selector:
    matchLabels:
      app: keypicksvivu
  template:
    metadata:
      labels:
        app: keypicksvivu
    spec:
      containers:
      - name: app
        image: your-registry/keypicksvivu:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
---
apiVersion: v1
kind: Service
metadata:
  name: keypicksvivu
spec:
  selector:
    app: keypicksvivu
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### 2. Deploy

```bash
# Build và push image
docker build -t your-registry/keypicksvivu:latest .
docker push your-registry/keypicksvivu:latest

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=mongodb-uri='your-mongodb-uri' \
  --from-literal=jwt-secret='your-jwt-secret'

# Deploy
kubectl apply -f k8s/

# Check status
kubectl get pods
kubectl get services
```

---

## 🔄 CI/CD Setup

### GitHub Actions (Tự động deploy)

File `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: docker build -t keypicksvivu:latest .
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker tag keypicksvivu:latest your-registry/keypicksvivu:latest
        docker push your-registry/keypicksvivu:latest
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /app/KeypicksVIVU
          git pull
          docker-compose -f docker-compose.prod.yml down
          docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔧 Post-Deployment

### 1. Monitoring Setup

```bash
# Install monitoring tools
docker run -d --name portainer \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  portainer/portainer-ce

# Access Portainer at http://your-server:9000
```

### 2. Backup Strategy

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /data/backup

# Automated backup script
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongodb mongodump --out /data/backup/backup_$DATE
find /data/backup -type d -mtime +7 -exec rm -rf {} +
EOF

chmod +x /root/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /root/backup.sh" | crontab -
```

### 3. Security Checklist

- [ ] Đổi tất cả passwords mặc định
- [ ] Setup firewall (UFW/iptables)
- [ ] Enable automatic security updates
- [ ] Setup fail2ban
- [ ] Regular backup testing
- [ ] Monitor logs
- [ ] Keep Docker images updated

---

## 📊 Monitoring & Logging

### Setup Logging with ELK Stack (Optional)

```yaml
# Add to docker-compose.prod.yml
  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    
  logstash:
    image: logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    
  kibana:
    image: kibana:8.5.0
    ports:
      - "5601:5601"
```

---

## 🆘 Troubleshooting

### Container keeps restarting
```bash
docker-compose -f docker-compose.prod.yml logs app
```

### High memory usage
```bash
docker stats
docker system prune -a
```

### Database connection issues
```bash
docker-compose -f docker-compose.prod.yml exec mongodb mongosh
```

---

## 📚 Resources

- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)

---

**Need help?** Open an issue on GitHub or contact the team.

