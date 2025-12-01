# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

Dependencies are currently being installed. If not complete, run:

```bash
npm install
```

## Step 2: Configure Your OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

2. Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

3. Edit `.env` and add your key:

```env
OPENAI_API_KEY=sk-your-actual-key-here
PORT=3001
SCRAPE_INTERVAL_MINUTES=15
```

## Step 3: Start the Application

### Development Mode (Recommended)

Run both frontend and backend:

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### First-Time Setup

The app will automatically:
1. Create the SQLite database
2. Run an initial news scraping after 5 seconds
3. Continue scraping every 15 minutes

### Manual News Scraping

To manually trigger news gathering:

```bash
npm run scrape
```

Or via the UI:
- Click the **"Gather News"** button in the header

Or via API:
```bash
curl -X POST http://localhost:3001/api/scrape
```

## Step 4: View Your News Feed

Open your browser to:
- **http://localhost:5173**

You should see:
- Breaking news articles appearing automatically
- Each article card with headline, summary, credibility score
- Click any article to read the full AI-generated story
- Auto-refresh every 30 seconds

## Troubleshooting

### "No articles appearing"

**Solution:**
1. Check that your OpenAI API key is set correctly in `.env`
2. Wait 5 seconds after startup for initial scrape
3. Check backend terminal for errors
4. Manually trigger: `npm run scrape`

### "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3001 already in use"

**Solution:**
Change the port in `.env`:
```env
PORT=3002
```

### OpenAI API errors

**Common causes:**
- Invalid API key
- Insufficient credits
- Rate limit exceeded

**Solution:**
1. Verify your API key at [OpenAI Platform](https://platform.openai.com/api-keys)
2. Check your billing/credits
3. Wait a few minutes if rate limited

## What's Happening Behind the Scenes

When you start the app:

1. **Database Initialize** (instant)
   - Creates SQLite database at `./data/news.db`
   - Sets up tables and indexes

2. **Server Start** (instant)
   - Express server on port 3001
   - API endpoints ready

3. **Initial Scrape** (2-5 minutes, after 5 second delay)
   - Gathers articles from 15+ sources
   - AI processes each article
   - Saves breaking news to database
   - Progress shown in terminal

4. **Scheduled Scraping** (every 15 minutes)
   - Automatic background job
   - Keeps news fresh

5. **Frontend** (instant)
   - React app on port 5173
   - Auto-refreshes every 30 seconds
   - Displays articles in real-time

## Production Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

The production server:
- Serves everything from port 3001
- Includes both frontend and API
- Runs scheduled scraping

## Project Structure Overview

```
📁 server/          → Backend (Express + AI)
  ├── ai/           → OpenAI integration
  ├── database/     → SQLite schema
  ├── scraper/      → News collection
  └── routes/       → API endpoints

📁 src/             → Frontend (React)
  └── components/   → UI components

📁 data/            → Database (auto-created)

📄 .env             → Your config (create this!)
📄 .env.example     → Template
```

## Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Create `.env` with your OpenAI API key
3. ✅ Run `npm run dev`
4. 🎉 Watch breaking news appear!

## Need Help?

Check the full [README.md](./README.md) for:
- Complete API documentation
- Architecture details
- Configuration options
- Advanced features
