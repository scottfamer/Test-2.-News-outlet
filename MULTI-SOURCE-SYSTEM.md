# Multi-Source News Gathering System

## Overview

Your AI Breaking News app has been upgraded from 15 fixed sources to a **dynamic, scalable multi-source system** that can automatically discover, validate, and manage hundreds or thousands of news sources.

---

## Key Features

### ✅ Dynamic Source Management
- **Database-driven**: All sources stored in SQL database
- **Automatic health tracking**: Each source monitored for reliability
- **Credibility scoring**: Sources rated 0-100 based on performance
- **Auto-disable/re-enable**: Failed sources automatically managed

### ✅ Source Discovery
- **Auto-discovery**: Finds RSS/Atom feeds from any website
- **Bulk discovery**: Process multiple websites at once
- **Manual addition**: Add custom sources via API

### ✅ Health Monitoring
- **Success rate tracking**: Records every fetch attempt
- **Health scores**: 0-100 based on reliability
- **Automatic cleanup**: Removes consistently failing sources
- **Retry system**: Re-enables sources after cooldown period

### ✅ Multi-Protocol Support
- **RSS feeds** ✅ Fully implemented
- **Atom feeds** ✅ Fully implemented
- **HTML scraping** 🔄 Ready for implementation
- **API endpoints** 🔄 Ready for implementation
- **Sitemaps** 🔄 Ready for implementation

---

## Initial Sources (30+ Verified)

The system seeds with 30+ high-quality sources:

### Global News
- BBC News, Reuters, AP News, The Guardian, Al Jazeera, NPR, CNN, ABC News, USA Today

### Technology
- TechCrunch, Ars Technica, Wired, The Verge

### Science
- Nature, Scientific American, Science Daily

### Business
- Financial Times, Wall Street Journal, Bloomberg, The Economist

### Government & Organizations
- WHO, NASA, US State Department

### Regional News
- Deutsche Welle (Germany), France 24, NHK World (Japan), SCMP (Hong Kong)

### Think Tanks
- Brookings Institution, Council on Foreign Relations

---

## API Endpoints

### Source Management

#### `GET /api/sources`
Get all sources with optional filters
```bash
# Get all active sources
GET /api/sources

# Get all sources (including inactive)
GET /api/sources?active=false

# Get sources with health >= 70
GET /api/sources?minHealth=70
```

#### `GET /api/sources/stats`
Get statistics about all sources
```json
{
  "stats": {
    "total": 150,
    "active": 142,
    "verified": 35,
    "avgHealth": 87,
    "avgCredibility": 75
  },
  "healthDistribution": {
    "excellent": 98,  // >= 90
    "good": 32,       // 70-89
    "fair": 12,       // 50-69
    "poor": 8         // < 50
  }
}
```

#### `GET /api/sources/:id`
Get specific source details

#### `POST /api/sources`
Add a new source manually
```json
{
  "name": "Example News",
  "url": "https://example.com/feed",
  "type": "rss",
  "category": "technology",
  "credibility_score": 70
}
```

#### `PUT /api/sources/:id`
Update a source
```json
{
  "credibility_score": 85,
  "is_verified": true
}
```

#### `DELETE /api/sources/:id`
Delete a source

### Discovery Operations

#### `POST /api/sources/discover`
Discover feeds from a website
```json
{
  "websiteUrl": "https://example.com",
  "sourceName": "Example News",
  "category": "technology"
}
```

#### `POST /api/sources/discover/bulk`
Discover from multiple websites
```json
{
  "websites": [
    {
      "url": "https://example1.com",
      "name": "Example 1",
      "category": "tech"
    },
    {
      "url": "https://example2.com",
      "name": "Example 2",
      "category": "science"
    }
  ]
}
```

#### `POST /api/sources/seed`
Seed initial sources (safe to run multiple times)

### Health Management

#### `POST /api/sources/health-check`
Run health checks manually

#### `POST /api/sources/retry-disabled`
Retry sources that were disabled

#### `POST /api/sources/cleanup`
Clean up permanently failed sources

---

## How It Works

### 1. Source Collection
```
Active Sources (health >= 30)
    ↓
Fetch Articles (RSS/Atom/HTML/API)
    ↓
Record Success/Failure
    ↓
Update Health Score
```

### 2. Health Scoring
```
Health Score = (Success Count / Total Attempts) * 100

Examples:
- 95/100 successful fetches = 95% health
- 50/100 successful fetches = 50% health
- 10/100 successful fetches = 10% health
```

### 3. Auto-Management
```
If health < 20 AND attempts >= 10:
    → Disable source
    
If disabled for 7+ days:
    → Re-enable for retry
    
If health < 10 AND attempts >= 20 AND retries >= 3:
    → Permanently delete (unverified sources only)
```

### 4. Credibility Boost
```
If health >= 95 AND attempts >= 20:
    → Increase credibility score by 5 (max 95)
```

---

## Scheduled Jobs

### News Scraping
- **Frequency**: Every 15 minutes (configurable)
- **Action**: Collects articles from all active sources
- **Health tracking**: Updates each source's health score

### Health Checks
- **Frequency**: Every 6 hours
- **Action**: 
  - Disables consistently failing sources
  - Boosts credibility of reliable sources
  - Logs warnings for declining sources

---

## Expanding Your Sources

### Method 1: Automatic Discovery
```bash
# Discover feeds from a website
curl -X POST https://your-app.com/api/sources/discover \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://www.nytimes.com",
    "sourceName": "New York Times",
    "category": "news"
  }'
```

### Method 2: Bulk Discovery
Create a list of websites and discover all at once:
```json
{
  "websites": [
    {"url": "https://www.nytimes.com", "name": "NYT", "category": "news"},
    {"url": "https://www.washingtonpost.com", "name": "WaPo", "category": "news"},
    {"url": "https://www.cnn.com", "name": "CNN", "category": "news"},
    // ... hundreds more
  ]
}
```

### Method 3: Manual Addition
```bash
# Add a known RSS feed
curl -X POST https://your-app.com/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Local News",
    "url": "https://localnews.com/feed.xml",
    "type": "rss",
    "category": "local",
    "country": "US",
    "credibility_score": 60
  }'
```

---

## Database Schema

### news_sources Table
```sql
- id: INTEGER (primary key)
- name: TEXT (source name)
- url: TEXT (feed URL, unique)
- type: TEXT (rss/atom/html/api/sitemap)
- category: TEXT (world/tech/business/etc)
- language: TEXT (default: 'en')
- country: TEXT
- credibility_score: INTEGER (0-100)
- is_active: BOOLEAN
- is_verified: BOOLEAN
- health_score: INTEGER (0-100)
- fetch_count: INTEGER
- success_count: INTEGER
- error_count: INTEGER
- avg_articles_per_fetch: REAL
- last_fetch_at: INTEGER (timestamp)
- last_success_at: INTEGER (timestamp)
- last_error: TEXT
- added_by: TEXT (system/manual/discovery)
- created_at: INTEGER (timestamp)
- updated_at: INTEGER (timestamp)
- metadata: TEXT (JSON)
```

---

## Monitoring Your Sources

### Check Overall Health
```bash
GET /api/sources/stats
```

### View Problem Sources
```bash
# Sources with health < 50
GET /api/sources?minHealth=0&active=false
```

### Monitor in Real-Time
Watch server logs for:
- ✅ Successful fetches
- ❌ Failed fetches
- ⚠️ Health warnings
- 🏥 Health check results
- 🗑️ Source removals

---

## Scaling Strategy

### Phase 1: Verified Sources (Current)
- 30+ hand-picked, high-quality sources
- All verified and tested
- **Status**: ✅ Complete

### Phase 2: Discovered Sources
- Discover from 100-500 major news sites
- Auto-validate and add
- **Next Step**: Run bulk discovery

### Phase 3: Crowdsourced Expansion
- Allow users to suggest sources
- Auto-validate suggested feeds
- Community verification system

### Phase 4: Global Coverage
- Discover local news from every major city
- Multi-language support
- Niche topic coverage (sports, entertainment, etc.)

---

## Best Practices

### Adding Sources
1. Always verify RSS/Atom feeds work before adding
2. Set appropriate credibility scores (50-70 for new sources)
3. Use descriptive names and correct categories
4. Mark verified sources as `is_verified: true`

### Managing Health
1. Run health checks regularly (automated every 6 hours)
2. Review disabled sources monthly
3. Manually verify high-performing sources
4. Clean up failed sources periodically

### Scaling Safely
1. Add sources in batches of 50-100
2. Monitor server load during expansion
3. Consider rate limiting for external APIs
4. Use health score filters (>= 30) to reduce noise

---

## Future Enhancements

### Planned Features
- [ ] HTML scraping support for sites without RSS
- [ ] API integration (Twitter, Reddit, etc.)
- [ ] Sitemap parser for comprehensive coverage
- [ ] Multi-language source support
- [ ] Geographic source filtering
- [ ] Source recommendation engine
- [ ] User-submitted source validation
- [ ] Real-time source monitoring dashboard

### Performance Optimizations
- [ ] Parallel fetching with worker pools
- [ ] CDN caching for frequent sources
- [ ] Database connection pooling
- [ ] Redis caching layer
- [ ] Source priority queues

---

## Troubleshooting

### No articles appearing
1. Check source health: `GET /api/sources/stats`
2. Run manual health check: `POST /api/sources/health-check`
3. Review server logs for errors
4. Verify OpenAI API key is set

### Too many failed sources
1. Run cleanup: `POST /api/sources/cleanup`
2. Retry disabled sources: `POST /api/sources/retry-disabled`
3. Check network connectivity
4. Review RSS feed URLs

### Low article quality
1. Increase minimum credibility score in scraper
2. Manually review and boost verified sources
3. Disable low-quality sources
4. Focus on verified sources only

---

## Summary

Your news app now has:
- ✅ **Dynamic source management** instead of fixed list
- ✅ **30+ verified sources** out of the box
- ✅ **Automatic discovery** system
- ✅ **Health monitoring** and auto-management
- ✅ **Scalable to thousands** of sources
- ✅ **API for full control**

**Next Steps:**
1. Deploy the updated system
2. Monitor initial performance
3. Run bulk discovery for 100-500 sites
4. Review and verify high-performing sources
5. Gradually scale to thousands of sources

🎉 **You're now ready to gather news from the entire internet!**
