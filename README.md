# 🚀 AI-Powered Breaking News Outlet

A modern, full-stack news aggregation system that uses AI to gather, process, and display breaking news from across the internet in real-time.

## ✨ Features

- **AI-Powered News Collection**: Automatically gathers news from 15+ trusted sources including BBC, Reuters, AP, NPR, and more
- **Intelligent Processing**: Uses OpenAI GPT-4 to analyze, summarize, and rewrite articles in professional journalism style
- **Credibility Scoring**: AI evaluates each article's credibility (0-100) based on source reliability and content quality
- **🎙️ Text-to-Speech Playback**: Auto-playing AI voice reads articles aloud as you scroll through the feed
- **TikTok-Style Reels Interface**: Swipe through news stories with full-screen, immersive cards
- **Real-Time Updates**: Auto-refreshing feed with new breaking news every 30 seconds
- **Single-Page Experience**: Clean, modern UI displaying all breaking news on one elegant page
- **Full Article View**: Click any article to read the complete AI-generated story
- **Automatic Deduplication**: Removes duplicate stories from multiple sources
- **Scheduled Scraping**: Runs every 15 minutes to keep news fresh

## 🏗️ Architecture

### Backend
- **Node.js + Express + TypeScript**: RESTful API server
- **SQLite Database**: Fast, embedded storage for articles
- **OpenAI GPT-4 Mini**: AI processing and analysis
- **OpenAI TTS (tts-1)**: Text-to-speech audio generation
- **RSS Parser**: Multi-source news aggregation
- **Cheerio**: Web scraping for full article content
- **Node-Cron**: Scheduled background jobs

### Frontend
- **React 18 + TypeScript**: Modern UI framework
- **Vite**: Lightning-fast development and builds
- **TailwindCSS**: Utility-first styling
- **Lucide React**: Beautiful icon system
- **Date-fns**: Time formatting

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
SCRAPE_INTERVAL_MINUTES=15
```

### 3. Run Development Mode

Start both backend and frontend:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 4. Manual Scraping (Optional)

Trigger a one-time news gathering:

```bash
npm run scrape
```

## 📡 API Endpoints

### GET /api/news
Returns list of latest breaking news articles.

**Response:**
```json
{
  "success": true,
  "count": 42,
  "articles": [
    {
      "id": 1,
      "headline": "Major Event Unfolds...",
      "summary": "Brief description...",
      "sourceUrl": "https://...",
      "timestamp": 1234567890,
      "credibilityScore": 85,
      "metadata": { "source": "BBC News" }
    }
  ]
}
```

### GET /api/news/:id
Returns full article content by ID.

**Response:**
```json
{
  "success": true,
  "article": {
    "id": 1,
    "headline": "...",
    "summary": "...",
    "fullText": "Complete article text...",
    "sourceUrl": "...",
    "credibilityScore": 85
  }
}
```

### POST /api/scrape
Manually triggers the AI news gathering pipeline.

**Response:**
```json
{
  "success": true,
  "message": "Scraping pipeline started"
}
```

### GET /api/news/:id/tts
Generates or retrieves cached text-to-speech audio for an article.

**Response:**
- Content-Type: `audio/mpeg`
- Returns MP3 audio stream
- Cached for 24 hours

**Example:**
```bash
curl http://localhost:3001/api/news/1/tts --output article.mp3
```

## 🤖 AI Pipeline Process

1. **Collection**: Gather articles from 15+ RSS feeds and news sources
2. **Deduplication**: Remove duplicate stories using content similarity
3. **AI Analysis**: Each article is processed by OpenAI GPT-4 to:
   - Determine if it qualifies as breaking news
   - Generate a compelling headline
   - Create a concise summary
   - Rewrite the full article in professional journalism style
   - Assign a credibility score (0-100)
4. **Storage**: Save approved articles to SQLite database
5. **Cleanup**: Remove articles older than 7 days

## 📁 Project Structure

```
ai-breaking-news/
├── server/                  # Backend code
│   ├── index.ts            # Express server
│   ├── database/
│   │   └── schema.ts       # SQLite database schema
│   ├── ai/
│   │   └── processor.ts    # OpenAI integration
│   ├── services/
│   │   └── tts.ts          # Text-to-speech service
│   ├── scraper/
│   │   ├── sources.ts      # News source configurations
│   │   ├── collector.ts    # Data collection logic
│   │   └── pipeline.ts     # Main processing pipeline
│   ├── routes/
│   │   └── news.ts         # API endpoints
│   └── scripts/
│       └── runScraper.ts   # Manual scraping script
├── src/                     # Frontend code
│   ├── App.tsx             # Main application
│   ├── components/
│   │   ├── Header.tsx      # Top navigation
│   │   ├── ReelsContainer.tsx # Scroll container with observer
│   │   ├── ReelCard.tsx    # Full-screen article card
│   │   ├── ArticleCard.tsx # News card component
│   │   └── ArticleModal.tsx # Full article viewer
│   ├── hooks/
│   │   └── useTTS.ts       # Text-to-speech hook
│   ├── api.ts              # API client
│   └── types.ts            # TypeScript types
├── data/
│   ├── news.db             # SQLite database (auto-created)
│   └── tts-cache/          # Cached TTS audio files
├── TTS_FEATURE.md          # TTS documentation
├── package.json
└── README.md
```

## 🎨 Features Breakdown

### Text-to-Speech (TTS)
- 🎙️ Auto-plays when article becomes visible (>50% in viewport)
- Stops instantly when swiping to another article
- Uses OpenAI's "alloy" voice for consistency
- Smart caching reduces API costs
- Mute/unmute control with visual feedback
- See [TTS_FEATURE.md](./TTS_FEATURE.md) for detailed documentation

### Auto-Refresh
- Frontend polls API every 30 seconds
- Smooth animations for new articles
- Loading states and error handling

### Credibility Scoring
- 🟢 80-100: High credibility (green badge)
- 🟡 60-79: Moderate credibility (yellow badge)
- 🟠 0-59: Lower credibility (orange badge)

### Responsive Design
- Mobile-first approach
- Optimized for phones, tablets, and desktops
- Touch-friendly interactions

### Article Sources
- BBC News
- Reuters
- Associated Press
- NPR
- The Guardian
- Al Jazeera
- CNN
- ABC News
- TechCrunch
- Science Daily
- Bloomberg
- Financial Times
- US Government News
- World Health Organization

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | (required) | Your OpenAI API key |
| `PORT` | 3001 | Backend server port |
| `DATABASE_PATH` | ./data/news.db | SQLite database location |
| `SCRAPE_INTERVAL_MINUTES` | 15 | Scraping frequency |
| `RUN_ON_STARTUP` | true | Run scraper when server starts |

## 🚢 Production Deployment

### Build for Production

```bash
npm run build
```

This creates:
- `dist/server/` - Compiled backend
- `dist/client/` - Optimized frontend

### Start Production Server

```bash
npm start
```

The server will:
- Serve the frontend at `http://localhost:3001`
- Provide API at `http://localhost:3001/api`
- Run scheduled scraping every 15 minutes

## 📊 Performance

- **Cold Start**: ~5 seconds (database initialization)
- **Initial Scrape**: ~2-5 minutes (depending on sources)
- **Subsequent Scrapes**: ~1-3 minutes
- **API Response Time**: <100ms (cached)
- **Frontend Load**: <1 second

## 🔒 Security Considerations

- API key stored in environment variables (never committed)
- CORS enabled for local development
- SQL injection prevention through prepared statements
- Input validation on all endpoints
- Rate limiting recommended for production

## 🐛 Troubleshooting

### No articles appearing?
- Check if `OPENAI_API_KEY` is set correctly
- Run manual scrape: `npm run scrape`
- Check server logs for errors

### "Failed to fetch news" error?
- Ensure backend is running on port 3001
- Check network connectivity
- Verify CORS settings

### Articles not updating?
- Check scheduled job is running (logs every 15 min)
- Manually trigger: `POST /api/scrape`
- Verify OpenAI API quota

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.

---

**Built with ❤️ using AI, TypeScript, React, and modern web technologies.**
