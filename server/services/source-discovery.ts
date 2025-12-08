import axios from 'axios';
import Parser from 'rss-parser';
import { sourceQueries, NewsSource } from '../database/sources-schema.js';

const rssParser = new Parser();

// Curated list of major news sources to seed the system
const SEED_SOURCES: Omit<NewsSource, 'id' | 'created_at' | 'updated_at'>[] = [
  // Major Global News
  { name: 'BBC News', url: 'http://feeds.bbci.co.uk/news/rss.xml', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'Reuters Top News', url: 'https://feeds.reuters.com/reuters/topNews', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'AP News', url: 'https://feeds.apnews.com/rss/topnews', type: 'rss', category: 'world', credibility_score: 95, is_verified: true },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', type: 'rss', category: 'world', credibility_score: 90, is_verified: true },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss', category: 'world', credibility_score: 85, is_verified: true },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', type: 'rss', category: 'us', credibility_score: 90, is_verified: true },
  { name: 'CNN Top Stories', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', type: 'rss', category: 'us', credibility_score: 80, is_verified: true },
  { name: 'ABC News', url: 'https://abcnews.go.com/abcnews/topstories', type: 'rss', category: 'us', credibility_score: 85, is_verified: true },
  { name: 'USA Today', url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories', type: 'rss', category: 'us', credibility_score: 80, is_verified: true },
  
  // Tech & Science
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'rss', category: 'technology', credibility_score: 85, is_verified: true },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', type: 'rss', category: 'technology', credibility_score: 90, is_verified: true },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', type: 'rss', category: 'technology', credibility_score: 85, is_verified: true },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', type: 'rss', category: 'technology', credibility_score: 85, is_verified: true },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', type: 'rss', category: 'science', credibility_score: 90, is_verified: true },
  { name: 'Nature News', url: 'https://www.nature.com/nature.rss', type: 'rss', category: 'science', credibility_score: 95, is_verified: true },
  { name: 'Scientific American', url: 'https://rss.sciam.com/ScientificAmerican-Global', type: 'rss', category: 'science', credibility_score: 95, is_verified: true },
  
  // Business & Finance
  { name: 'Financial Times', url: 'https://www.ft.com/?format=rss', type: 'rss', category: 'business', credibility_score: 90, is_verified: true },
  { name: 'Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml', type: 'rss', category: 'business', credibility_score: 90, is_verified: true },
  { name: 'Bloomberg Markets', url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml', type: 'rss', category: 'business', credibility_score: 90, is_verified: true },
  { name: 'The Economist', url: 'https://www.economist.com/the-world-this-week/rss.xml', type: 'rss', category: 'business', credibility_score: 95, is_verified: true },
  
  // Government & Policy
  { name: 'WHO News', url: 'https://www.who.int/rss-feeds/news-english.xml', type: 'rss', category: 'health', credibility_score: 100, is_verified: true },
  { name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', type: 'rss', category: 'science', credibility_score: 100, is_verified: true },
  { name: 'US State Department', url: 'https://www.state.gov/rss-feed/press-releases/feed/', type: 'rss', category: 'politics', credibility_score: 95, is_verified: true },
  
  // Regional News - Europe
  { name: 'Deutsche Welle', url: 'https://rss.dw.com/xml/rss-en-all', type: 'rss', category: 'world', country: 'DE', credibility_score: 85, is_verified: true },
  { name: 'France 24', url: 'https://www.france24.com/en/rss', type: 'rss', category: 'world', country: 'FR', credibility_score: 85, is_verified: true },
  
  // Regional News - Asia
  { name: 'NHK World', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', type: 'rss', category: 'world', country: 'JP', credibility_score: 85, is_verified: true },
  { name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed', type: 'rss', category: 'world', country: 'HK', credibility_score: 80, is_verified: true },
  
  // Think Tanks & Research
  { name: 'Brookings Institution', url: 'https://www.brookings.edu/feed/', type: 'rss', category: 'politics', credibility_score: 90, is_verified: true },
  { name: 'Council on Foreign Relations', url: 'https://www.cfr.org/rss/feed/recent', type: 'rss', category: 'politics', credibility_score: 90, is_verified: true },
  
  // Google News (Aggregator)
  { name: 'Google News', url: 'https://news.google.com/rss', type: 'rss', category: 'general', credibility_score: 70 },
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
