# 🚀 Deployment Guide - AI Breaking News

## Platform Recommendations

Your application requires:
- ✅ Persistent server process (Express)
- ✅ Scheduled jobs (cron)
- ✅ File storage (SQLite database)
- ✅ Environment variables (OpenAI API key)

**Best Platforms:**
1. **Render** ⭐ (Recommended - Free tier available)
2. **Railway** (Free tier with credit)
3. **Fly.io** (Free tier available)
4. **DigitalOcean App Platform** (Paid)
5. **AWS/GCP/Azure** (Advanced)

---

## 🎯 Option 1: Deploy to Render (Recommended)

### Why Render?
- ✅ Free tier with persistent disk
- ✅ Easy deployment from GitHub
- ✅ Supports scheduled jobs
- ✅ Environment variables built-in
- ✅ Auto-deploy on push

### Steps:

#### 1. Prepare Your Code

Create `render.yaml`:

```yaml
services:
  - type: web
    name: ai-breaking-news
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: OPENAI_API_KEY
        sync: false  # Set in Render dashboard
      - key: PORT
        value: 10000
      - key: SCRAPE_INTERVAL_MINUTES
        value: 15
    disk:
      name: news-data
      mountPath: /opt/render/project/src/data
      sizeGB: 1
```

#### 2. Update package.json scripts

Ensure these scripts exist (they already do):
```json
{
  "scripts": {
    "build": "npm run build:server && npm run build:client",
    "start": "node dist/server/index.js"
  }
}
```

#### 3. Deploy to Render

**Option A: Via GitHub (Recommended)**

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - AI Breaking News"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-breaking-news.git
git push -u origin main
```

2. Go to [render.com](https://render.com) and sign up

3. Click **"New +"** → **"Web Service"**

4. Connect your GitHub repository

5. Configure:
   - **Name:** ai-breaking-news
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add environment variable:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** Your OpenAI API key

7. Enable **Persistent Disk**:
   - Mount path: `/opt/render/project/src/data`
   - Size: 1 GB

8. Click **"Create Web Service"**

**Option B: Via Render CLI**

```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# Deploy
render deploy
```

#### 4. Access Your App

Your app will be live at: `https://ai-breaking-news.onrender.com`

**Note:** Free tier spins down after 15 min of inactivity. First request may take 30-60 seconds.

---

## 🚂 Option 2: Deploy to Railway

### Steps:

#### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 2. Login

```bash
railway login
```

#### 3. Initialize Project

```bash
railway init
```

#### 4. Add Environment Variables

```bash
railway variables set OPENAI_API_KEY=your_key_here
railway variables set PORT=3001
railway variables set NODE_ENV=production
```

#### 5. Deploy

```bash
railway up
```

#### 6. Enable Persistent Storage

In Railway dashboard:
1. Go to your project
2. Click "Volumes"
3. Add volume:
   - Mount path: `/app/data`
   - Size: 1 GB

Your app will be live at: `https://your-app.railway.app`

---

## ✈️ Option 3: Deploy to Fly.io

### Steps:

#### 1. Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Create Dockerfile

```dockerfile
# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "start"]
```

#### 3. Create fly.toml

```toml
app = "ai-breaking-news"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

[mounts]
  source = "news_data"
  destination = "/app/data"
```

#### 4. Deploy

```bash
# Login
flyctl auth login

# Create app
flyctl launch

# Set secrets
flyctl secrets set OPENAI_API_KEY=your_key_here

# Create persistent volume
flyctl volumes create news_data --size 1

# Deploy
flyctl deploy
```

Your app will be live at: `https://ai-breaking-news.fly.dev`

---

## 🐳 Option 4: Docker (Self-Hosted)

### Create Production Docker Setup

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SCRAPE_INTERVAL_MINUTES=15
    volumes:
      - news-data:/app/data
    restart: unless-stopped

volumes:
  news-data:
```

#### Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./

EXPOSE 3001

CMD ["npm", "start"]
```

#### Deploy

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📝 Pre-Deployment Checklist

Before deploying to any platform:

### 1. Environment Variables
- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `PORT` - Server port (platform-specific)
- [ ] `NODE_ENV=production`
- [ ] `SCRAPE_INTERVAL_MINUTES` - Default: 15

### 2. Build Test
```bash
npm run build
npm start
```

Visit `http://localhost:3001` to verify production build works.

### 3. Database
- [ ] Ensure persistent volume/disk is configured
- [ ] Path: `/app/data` or `/opt/render/project/src/data`

### 4. Git Setup
```bash
git init
git add .
git commit -m "Ready for deployment"
```

### 5. .gitignore Check
Make sure these are ignored:
```
node_modules/
dist/
.env
data/*.db
```

---

## 🔧 Platform-Specific Notes

### Render
- Free tier sleeps after 15 min inactivity
- 750 hours/month free (persistent with paid plan)
- Persistent disk requires paid plan ($7/month)

### Railway
- $5 free credit monthly
- Sleeps after inactivity on free tier
- Persistent volumes included

### Fly.io
- Free tier: 3 shared VMs
- Persistent volumes: 3GB free
- No sleep on free tier

### Docker (Self-Hosted)
- Full control
- Requires server/VPS
- Best for production with traffic

---

## 🎯 Recommended Deployment Flow

**For Testing/Development:**
→ **Render** (easiest, free tier)

**For Production:**
→ **Railway** or **Fly.io** (better uptime, persistent storage)

**For Enterprise:**
→ **Docker + Cloud Provider** (AWS/GCP/Azure)

---

## 🐛 Troubleshooting

### App Won't Start
1. Check logs for errors
2. Verify all environment variables are set
3. Ensure `NODE_ENV=production`
4. Check build logs for failures

### Database Not Persisting
1. Verify persistent volume is mounted
2. Check mount path matches `DATABASE_PATH`
3. Ensure volume has write permissions

### Scraping Not Working
1. Check `OPENAI_API_KEY` is set correctly
2. Verify cron jobs are running (check logs)
3. Ensure no rate limiting from OpenAI

### High Memory Usage
1. Reduce `SCRAPE_INTERVAL_MINUTES`
2. Limit concurrent AI processing in pipeline
3. Add database cleanup script

---

## 🔐 Security Best Practices

1. **Never commit `.env` file**
2. **Use platform secret management** for API keys
3. **Enable HTTPS** (automatic on Render/Railway/Fly)
4. **Set rate limiting** on API endpoints
5. **Monitor OpenAI usage** to avoid unexpected charges
6. **Regular backups** of SQLite database

---

## 📊 Monitoring

### Check App Health
```bash
# Render
render logs -s ai-breaking-news

# Railway
railway logs

# Fly.io
flyctl logs

# Docker
docker-compose logs -f
```

### Database Size
```bash
# SSH into container
du -h data/news.db
```

### OpenAI Usage
Monitor at: https://platform.openai.com/usage

---

## 🚀 Quick Deploy Commands

### Render (GitHub)
1. Push to GitHub
2. Connect repo in Render dashboard
3. Deploy automatically

### Railway
```bash
railway init
railway up
```

### Fly.io
```bash
flyctl launch
flyctl deploy
```

### Docker
```bash
docker-compose up -d
```

---

Need help? Check the logs first, then consult platform documentation!
