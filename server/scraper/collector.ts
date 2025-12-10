import axios from 'axios';
import * as cheerio from 'cheerio';
import * as RssParserModule from 'rss-parser';
import { sourceQueries, NewsSource } from '../database/sources-schema.js';

const RssParser = (RssParserModule as any).default || RssParserModule;
const rssParser = new RssParser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
  },
});

export interface RawArticle {
  title: string;
  content: string;
  url: string;
  source: string;
  publishedAt: Date;
}

/**
 * Fetch content from RSS feed
 */
async function fetchRSS(source: NewsSource): Promise<RawArticle[]> {
  try {
    const feed = await rssParser.parseURL(source.url);
    const articles: RawArticle[] = [];

    for (const item of feed.items.slice(0, 10)) {
      if (!item.title || !item.link) continue;

      // Try to get full content
      let content = item.contentSnippet || item.content || item.summary || '';
      
      // If content is too short, try to fetch the full article
      if (content.length < 200 && item.link) {
        const fullContent = await fetchFullArticle(item.link);
        if (fullContent) {
          content = fullContent;
        }
      }

      articles.push({
        title: item.title,
        content,
        url: item.link,
        source: source.name,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      });
    }

    return articles;
  } catch (error) {
    console.error(`❌ Error fetching RSS from ${source.name}:`, error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

/**
 * Fetch full article content from URL
 */
async function fetchFullArticle(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
      },
    });

    const $ = cheerio.load(response.data);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, iframe, .ad, .advertisement').remove();

    // Try to find article content using common selectors
    const selectors = [
      'article',
      '[role="article"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '.story-body',
    ];

    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 200) {
          return text;
        }
      }
    }

    // Fallback: get all paragraph text
    const paragraphs = $('p').map((_, el) => $(el).text()).get().join('\n');
    return paragraphs.length > 200 ? paragraphs : null;
  } catch (error) {
    return null;
  }
}

/**
 * Collect articles from all sources
 */
export async function collectArticles(): Promise<RawArticle[]> {
  console.log('🔍 Starting article collection...');
  
  // Get active sources from database with good health scores
  const sources = sourceQueries.getAll(true, 30); // Active sources with health >= 30
  console.log(`📡 Collecting from ${sources.length} active sources`);
  
  const allArticles: RawArticle[] = [];
  const promises = sources.map(async (source: NewsSource) => {
    try {
      let articles: RawArticle[] = [];
      
      if (source.type === 'rss' || source.type === 'atom') {
        articles = await fetchRSS(source);
      }
      // Add support for other types (html, api) here in the future
      
      // Record the fetch attempt
      if (source.id) {
        sourceQueries.recordFetchAttempt(
          source.id,
          articles.length > 0,
          articles.length
        );
      }
      
      return { source, articles };
    } catch (error) {
      console.error(`Error with source ${source.name}:`, error);
      
      // Record the failed attempt
      if (source.id) {
        sourceQueries.recordFetchAttempt(
          source.id,
          false,
          0,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
      
      return { source, articles: [] };
    }
  });

  const results = await Promise.allSettled(promises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { source, articles } = result.value;
      allArticles.push(...articles);
      if (articles.length > 0) {
        console.log(`✅ ${source.name}: ${articles.length} articles`);
      } else {
        console.log(`⏭️  ${source.name}: 0 articles`);
      }
    } else {
      console.error(`❌ ${sources[index].name}: Failed`);
    }
  });

  console.log(`📰 Total collected: ${allArticles.length} articles from ${sources.length} sources`);
  return allArticles;
}

/**
 * Calculate similarity between two strings using a simple algorithm
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = str2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
}

/**
 * Extract key entities/topics from article title and content
 */
function extractKeywords(text: string): Set<string> {
  const normalized = text.toLowerCase();
  const keywords = new Set<string>();
  
  // Common news topic indicators
  const patterns = [
    /earthquake/i, /tsunami/i, /hurricane/i, /flood/i, /fire/i,
    /explosion/i, /attack/i, /crash/i, /collision/i,
    /election/i, /vote/i, /summit/i, /treaty/i, /sanctions/i,
    /outbreak/i, /pandemic/i, /virus/i, /disease/i,
    /protest/i, /strike/i, /riot/i, /demonstration/i,
    /launched/i, /announced/i, /revealed/i, /discovered/i
  ];
  
  // Extract matching patterns
  patterns.forEach(pattern => {
    if (pattern.test(normalized)) {
      const match = normalized.match(pattern);
      if (match) keywords.add(match[0]);
    }
  });
  
  // Extract proper nouns (capitalized words) - likely location/person names
  const words = text.split(/\s+/);
  words.forEach(word => {
    if (word.length > 3 && /^[A-Z]/.test(word)) {
      keywords.add(word.toLowerCase());
    }
  });
  
  return keywords;
}

/**
 * Check if two articles are about the same event/topic
 */
function areSimilarTopics(article1: RawArticle, article2: RawArticle): boolean {
  // 1. Calculate title similarity
  const titleSimilarity = calculateSimilarity(article1.title, article2.title);
  
  // If titles are very similar (>70%), likely the same story
  if (titleSimilarity > 0.7) return true;
  
  // 2. Check for common keywords/entities
  const keywords1 = extractKeywords(article1.title + ' ' + article1.content.substring(0, 200));
  const keywords2 = extractKeywords(article2.title + ' ' + article2.content.substring(0, 200));
  
  const commonKeywords = new Set([...keywords1].filter(x => keywords2.has(x)));
  
  // If they share multiple significant keywords and moderate title similarity, likely same event
  if (commonKeywords.size >= 2 && titleSimilarity > 0.4) return true;
  
  // 3. Check content similarity for short articles
  if (article1.content.length < 500 && article2.content.length < 500) {
    const contentSimilarity = calculateSimilarity(
      article1.content.substring(0, 300),
      article2.content.substring(0, 300)
    );
    if (contentSimilarity > 0.6) return true;
  }
  
  return false;
}

/**
 * Remove duplicate articles based on topic/event similarity
 * Keeps the article from the highest credibility source
 */
export function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const unique: RawArticle[] = [];
  const removed: RawArticle[] = [];
  
  // Define source credibility scores for prioritization
  const sourceCredibility: Record<string, number> = {
    'BBC News': 95, 'Reuters': 95, 'Associated Press': 95,
    'The Guardian': 90, 'NPR News': 90, 'PBS NewsHour': 90,
    'New York Times': 95, 'Washington Post': 90,
    'Al Jazeera': 85, 'CNN': 80, 'ABC News': 85,
    // Add more as needed
  };

  for (const article of articles) {
    let isDuplicate = false;
    
    for (let i = 0; i < unique.length; i++) {
      if (areSimilarTopics(article, unique[i])) {
        isDuplicate = true;
        
        // Keep the one from higher credibility source
        const articleCred = sourceCredibility[article.source] || 50;
        const existingCred = sourceCredibility[unique[i].source] || 50;
        
        if (articleCred > existingCred) {
          // Replace existing with this higher credibility article
          console.log(`🔄 Replacing ${unique[i].source} with ${article.source} for: "${article.title.substring(0, 60)}..."`);
          removed.push(unique[i]);
          unique[i] = article;
        } else {
          console.log(`⏭️  Skipping duplicate from ${article.source}: "${article.title.substring(0, 60)}..."`);
          removed.push(article);
        }
        break;
      }
    }
    
    if (!isDuplicate) {
      unique.push(article);
    }
  }

  console.log(`🔄 Removed ${removed.length} duplicate articles (kept highest credibility sources)`);
  return unique;
}
