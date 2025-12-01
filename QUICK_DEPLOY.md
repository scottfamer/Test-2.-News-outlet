# ⚡ Quick Deploy Guide

Choose your platform and follow the steps:

## 🎯 Render (Easiest - Recommended for Beginners)

### Prerequisites
- GitHub account
- Render account (free): https://render.com

### Steps (5 minutes)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/ai-breaking-news.git
git push -u origin main
```

2. **Deploy on Render**
   - Go to https://render.com/dashboard
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repo
   - Render will auto-detect settings from `render.yaml`
   - Add environment variable:
     - Key: `OPENAI_API_KEY`
     - Value: `your-openai-api-key`
   - Click **"Create Web Service"**

3. **Done!** Your app will be at: `https://ai-breaking-news-XXXX.onrender.com`

---

## 🚂 Railway (Best Free Tier)

### Prerequisites
- Railway account: https://railway.app

### Steps (3 minutes)

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up

# Set environment variables
railway variables set OPENAI_API_KEY=your-key-here

# Add persistent storage (in Railway dashboard)
# Go to your service → Volumes → Create Volume
# Mount path: /app/data
```

**Done!** Your app will be at: `https://your-app.railway.app`

---

## ✈️ Fly.io (Best Uptime)

### Prerequisites
- Fly.io account: https://fly.io

### Steps (5 minutes)

```bash
# Install Fly CLI (Mac)
brew install flyctl

# Login
flyctl auth login

# Launch app (will use fly.toml config)
flyctl launch

# Set secrets
flyctl secrets set OPENAI_API_KEY=your-key-here

# Create persistent volume
flyctl volumes create news_data --size 1

# Deploy
flyctl deploy
```

**Done!** Your app will be at: `https://ai-breaking-news.fly.dev`

---

## 🐳 Docker (Self-Hosted)

### Prerequisites
- Docker Desktop installed
- Server or local machine

### Steps (2 minutes)

1. **Create `.env` file**
```bash
echo "OPENAI_API_KEY=your-key-here" > .env
```

2. **Run with Docker Compose**
```bash
docker-compose up -d
```

3. **View logs**
```bash
docker-compose logs -f
```

**Done!** Your app will be at: `http://localhost:3001`

---

## 📋 Deployment Comparison

| Platform | Free Tier | Persistent Storage | Setup Time | Recommended For |
|----------|-----------|-------------------|------------|-----------------|
| **Render** | ✅ Yes | ⚠️ Paid ($7/mo) | 5 min | Beginners |
| **Railway** | ✅ Yes ($5 credit) | ✅ Included | 3 min | **Best Overall** |
| **Fly.io** | ✅ Yes | ✅ 3GB free | 5 min | Production |
| **Docker** | N/A | ✅ Yes | 2 min | Self-hosted |

---

## ⚡ Super Quick Deploy (Railway - Recommended)

**One-command deploy:**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login && railway init && railway up

# 3. Set API key
railway variables set OPENAI_API_KEY=your-key-here

# 4. Done! Get your URL
railway domain
```

**Total time: 3 minutes** ⏱️

---

## 🔑 Getting Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Copy the key (starts with `sk-`)
4. Use it in your deployment

---

## ✅ Post-Deployment Checklist

After deploying:

- [ ] Visit your app URL
- [ ] Wait 30 seconds for initial startup
- [ ] Trigger manual scrape (click "Gather News" button)
- [ ] Wait 2-5 minutes for first articles to appear
- [ ] Verify auto-refresh works
- [ ] Check that articles are clickable

---

## 🆘 Need Help?

**App not starting?**
- Check deployment logs
- Verify `OPENAI_API_KEY` is set correctly
- Ensure all environment variables are present

**No articles appearing?**
- Wait 5 minutes for initial scrape
- Check backend logs for errors
- Manually trigger scrape via API: `POST /api/scrape`

**Database not persisting?**
- Verify persistent volume is configured
- Check mount path matches `DATABASE_PATH`

---

## 🎉 You're Done!

Your AI-powered breaking news outlet is now live! 🚀

**Next steps:**
1. Share your URL with others
2. Monitor OpenAI usage at https://platform.openai.com/usage
3. Check logs periodically for errors
4. Consider upgrading for better uptime

---

**Recommended:** Deploy to **Railway** for the best free tier experience!
