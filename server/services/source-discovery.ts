import axios from 'axios';
import * as RssParserModule from 'rss-parser';
import { sourceQueries, NewsSource } from '../database/sources-schema.js';

const RssParser = (RssParserModule as any).default || RssParserModule;
const rssParser = new RssParser();

// User-specified exclusive source list
const SEED_SOURCES: Omit<NewsSource, 'id' | 'created_at' | 'updated_at'>[] = [
  // Major Global News
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'Associated Press', url: 'https://feeds.apnews.com/rss/apnews/topnews', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', type: 'rss', category: 'us', credibility_score: 90, is_verified: true },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', type: 'rss', category: 'world', credibility_score: 90, is_verified: true },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss', category: 'world', credibility_score: 85, is_verified: true },
  { name: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', type: 'rss', category: 'us', credibility_score: 80, is_verified: true },
  { name: 'ABC News', url: 'https://abcnews.go.com/abcnews/topstories', type: 'rss', category: 'us', credibility_score: 85, is_verified: true },
  { name: 'USA Today', url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories', type: 'rss', category: 'us', credibility_score: 80, is_verified: true },
  { name: 'World Health Organization', url: 'https://www.who.int/rss-feeds/news-english.xml', type: 'rss', category: 'health', credibility_score: 100, is_verified: true },
  
  // Tech & Science
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss', category: 'technology', credibility_score: 85, is_verified: true },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', type: 'rss', category: 'science', credibility_score: 90, is_verified: true },
  
  // Financial News
  { name: 'Bloomberg', url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml', type: 'rss', category: 'business', credibility_score: 90, is_verified: true },
  { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', type: 'rss', category: 'business', credibility_score: 90, is_verified: true },
  
  // International News
  { name: 'Euronews', url: 'https://www.euronews.com/rss?level=theme&name=news', type: 'rss', category: 'world', credibility_score: 80, is_verified: true },
  { name: 'Deutsche Welle (DW)', url: 'https://rss.dw.com/rdf/rss-en-top', type: 'rss', category: 'world', country: 'DE', credibility_score: 85, is_verified: true },
  { name: 'France 24', url: 'https://www.france24.com/en/rss', type: 'rss', category: 'world', country: 'FR', credibility_score: 85, is_verified: true },
  { name: 'CBC News', url: 'https://www.cbc.ca/cmlink/rss-topstories', type: 'rss', category: 'world', country: 'CA', credibility_score: 85, is_verified: true },
  { name: 'Sky News', url: 'https://feeds.skynews.com/feeds/rss/world.xml', type: 'rss', category: 'world', country: 'UK', credibility_score: 80, is_verified: true },
  { name: 'Japan Times', url: 'https://www.japantimes.co.jp/feed/topstories', type: 'rss', category: 'world', country: 'JP', credibility_score: 85, is_verified: true },
  { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed', type: 'rss', category: 'world', country: 'HK', credibility_score: 80, is_verified: true },
  { name: 'The Telegraph', url: 'https://www.telegraph.co.uk/news/rss.xml', type: 'rss', category: 'world', country: 'UK', credibility_score: 80, is_verified: true },
  { name: 'The Independent', url: 'https://www.independent.co.uk/news/rss', type: 'rss', category: 'world', country: 'UK', credibility_score: 80, is_verified: true },
  { name: 'Times of India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', type: 'rss', category: 'world', country: 'IN', credibility_score: 75, is_verified: true },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/rss/topnews/rssfeed.xml', type: 'rss', category: 'world', country: 'IN', credibility_score: 75, is_verified: true },
  { name: 'Sydney Morning Herald', url: 'https://www.smh.com.au/rss/feed.xml', type: 'rss', category: 'world', country: 'AU', credibility_score: 80, is_verified: true },
  { name: 'The Globe and Mail', url: 'https://www.theglobeandmail.com/?service=rss', type: 'rss', category: 'world', country: 'CA', credibility_score: 85, is_verified: true },
  { name: 'RTÉ News (Ireland)', url: 'https://www.rte.ie/news/rss/news-headlines.xml', type: 'rss', category: 'world', country: 'IE', credibility_score: 85, is_verified: true },
  
  // Major US News
  { name: 'New York Times - World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'New York Times - Top Stories', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', type: 'rss', category: 'us', credibility_score: 95, is_verified: true },
  { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/world', type: 'rss', category: 'us', credibility_score: 90, is_verified: true },
  { name: 'Los Angeles Times', url: 'https://www.latimes.com/world-nation/rss2.0.xml', type: 'rss', category: 'us', credibility_score: 85, is_verified: true },
  { name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour/feeds/rss/headlines', type: 'rss', category: 'us', credibility_score: 90, is_verified: true },
  { name: 'Vox News', url: 'https://www.vox.com/rss/index.xml', type: 'rss', category: 'us', credibility_score: 80, is_verified: true },
  { name: 'Politico', url: 'https://www.politico.com/rss/politics.xml', type: 'rss', category: 'politics', credibility_score: 85, is_verified: true },
  { name: 'The Hill', url: 'https://thehill.com/feed/', type: 'rss', category: 'politics', credibility_score: 80, is_verified: true },
  { name: 'CBS News', url: 'https://www.cbsnews.com/latest/rss/main', type: 'rss', category: 'us', credibility_score: 85, is_verified: true },
  { name: 'NBC News', url: 'https://feeds.nbcnews.com/nbcnews/public/news', type: 'rss', category: 'us', credibility_score: 85, is_verified: true },
  { name: 'Fox News - World', url: 'http://feeds.foxnews.com/foxnews/world', type: 'rss', category: 'us', credibility_score: 70, is_verified: true },
  
  // Investigative & Independent
  { name: 'ProPublica', url: 'https://www.propublica.org/feeds/propublica/main', type: 'rss', category: 'investigative', credibility_score: 95, is_verified: true },
  { name: 'The Intercept', url: 'https://theintercept.com/feed/?lang=en', type: 'rss', category: 'investigative', credibility_score: 85, is_verified: true },
  { name: 'The Conversation', url: 'https://theconversation.com/articles.atom', type: 'atom', category: 'analysis', credibility_score: 90, is_verified: true },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topnews.rss', type: 'rss', category: 'technology', credibility_score: 95, is_verified: true },
  
  // Business & Finance
  { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/', type: 'rss', category: 'business', credibility_score: 85, is_verified: true },
  { name: 'Yahoo Finance', url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=yhoo&region=US&lang=en-US', type: 'rss', category: 'business', credibility_score: 75, is_verified: true },
  { name: 'Forbes', url: 'https://www.forbes.com/business/feed/', type: 'rss', category: 'business', credibility_score: 80, is_verified: true },
  { name: 'Business Insider', url: 'https://www.businessinsider.com/rss', type: 'rss', category: 'business', credibility_score: 75, is_verified: true },
  { name: 'The Economist', url: 'https://www.economist.com/latest/rss.xml', type: 'rss', category: 'business', credibility_score: 95, is_verified: true },
  { name: 'Investopedia', url: 'https://www.investopedia.com/feed.xml', type: 'rss', category: 'business', credibility_score: 80, is_verified: true },
  
  // Science & Nature
  { name: 'Nature News', url: 'https://www.nature.com/subjects/science/rss', type: 'rss', category: 'science', credibility_score: 95, is_verified: true },
  { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', type: 'rss', category: 'science', credibility_score: 90, is_verified: true },
  { name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', type: 'rss', category: 'science', credibility_score: 100, is_verified: true },
  { name: 'National Geographic', url: 'https://www.nationalgeographic.com/content/natgeo/en_us/index.rss', type: 'rss', category: 'science', credibility_score: 90, is_verified: true },
  { name: 'Live Science', url: 'https://www.livescience.com/feeds/all', type: 'rss', category: 'science', credibility_score: 85, is_verified: true },
  
  // Tech News
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', type: 'rss', category: 'technology', credibility_score: 85, is_verified: true },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', type: 'rss', category: 'technology', credibility_score: 85, is_verified: true },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', type: 'rss', category: 'technology', credibility_score: 90, is_verified: true },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', type: 'rss', category: 'technology', credibility_score: 80, is_verified: true },
  { name: 'Mashable', url: 'https://mashable.com/feeds/rss/all', type: 'rss', category: 'technology', credibility_score: 75, is_verified: true },
  { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml', type: 'rss', category: 'technology', credibility_score: 80, is_verified: true },
];

/**
 * Validates if a URL is a valid RSS/Atom feed
 */
async function validateFeed(url: string): Promise<boolean> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    
    await rssParser.parseString(response.data);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Attempts to discover RSS/Atom feeds from a website
 */
async function discoverFeeds(websiteUrl: string): Promise<string[]> {
  const feeds: string[] = [];
  
  try {
    const response = await axios.get(websiteUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' }
    });
    
    const html = response.data;
    
    // Look for RSS/Atom link tags
    const linkRegex = /<link[^>]*(?:type=["']application\/(?:rss|atom)\+xml["']|rel=["']alternate["'])[^>]*>/gi;
    const matches = html.match(linkRegex) || [];
    
    for (const match of matches) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        let feedUrl = hrefMatch[1];
        
        // Convert relative URLs to absolute
        if (!feedUrl.startsWith('http')) {
          const baseUrl = new URL(websiteUrl);
          feedUrl = new URL(feedUrl, baseUrl.origin).href;
        }
        
        feeds.push(feedUrl);
      }
    }
    
    // Try common RSS URL patterns
    const commonPatterns = [
      '/rss',
      '/feed',
      '/rss.xml',
      '/feed.xml',
      '/atom.xml',
      '/feeds/posts/default'
    ];
    
    const baseUrl = new URL(websiteUrl);
    for (const pattern of commonPatterns) {
      const testUrl = `${baseUrl.origin}${pattern}`;
      if (!feeds.includes(testUrl)) {
        feeds.push(testUrl);
      }
    }
  } catch (error) {
    console.error(`Error discovering feeds from ${websiteUrl}:`, error);
  }
  
  return feeds;
}

/**
 * Seeds the database with initial verified sources
 */
export async function seedSources() {
  console.log('🌱 Seeding news sources...');
  let added = 0;
  let skipped = 0;
  
  for (const source of SEED_SOURCES) {
    try {
      const existing = sourceQueries.getByUrl(source.url);
      if (existing) {
        skipped++;
        continue;
      }
      
      sourceQueries.insert(source);
      added++;
    } catch (error) {
      console.error(`Error adding source ${source.name}:`, error);
    }
  }
  
  console.log(`✅ Seeding complete: ${added} added, ${skipped} already exist`);
  return { added, skipped };
}

/**
 * Discovers and adds new sources from a given website
 */
export async function discoverAndAddSources(websiteUrl: string, sourceName?: string, category?: string) {
  console.log(`🔍 Discovering feeds from ${websiteUrl}...`);
  
  const feeds = await discoverFeeds(websiteUrl);
  const validFeeds: string[] = [];
  
  for (const feedUrl of feeds) {
    const isValid = await validateFeed(feedUrl);
    if (isValid) {
      validFeeds.push(feedUrl);
    }
  }
  
  console.log(`✅ Found ${validFeeds.length} valid feeds`);
  
  const added: NewsSource[] = [];
  for (const feedUrl of validFeeds) {
    try {
      const existing = sourceQueries.getByUrl(feedUrl);
      if (existing) {
        continue;
      }
      
      const newSource: NewsSource = {
        name: sourceName || new URL(websiteUrl).hostname,
        url: feedUrl,
        type: 'rss',
        category,
        credibility_score: 50, // Default, will be adjusted by health monitoring
        is_active: true,
        is_verified: false, // Requires manual verification
        added_by: 'discovery'
      };
      
      sourceQueries.insert(newSource);
      added.push(newSource);
    } catch (error) {
      console.error(`Error adding feed ${feedUrl}:`, error);
    }
  }
  
  return { discovered: validFeeds.length, added: added.length };
}

/**
 * Bulk discover sources from a list of websites
 */
export async function bulkDiscoverSources(websites: Array<{ url: string; name?: string; category?: string }>) {
  const results = {
    processed: 0,
    discovered: 0,
    added: 0
  };
  
  for (const site of websites) {
    try {
      const result = await discoverAndAddSources(site.url, site.name, site.category);
      results.processed++;
      results.discovered += result.discovered;
      results.added += result.added;
      
      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${site.url}:`, error);
    }
  }
  
  return results;
}
