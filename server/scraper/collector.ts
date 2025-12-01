import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import { NEWS_SOURCES, NewsSource } from './sources.js';

const rssParser = new Parser({
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
  
  const allArticles: RawArticle[] = [];
  const promises = NEWS_SOURCES.map(async (source) => {
    try {
      if (source.type === 'rss') {
        return await fetchRSS(source);
      }
      return [];
    } catch (error) {
      console.error(`Error with source ${source.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(promises);
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
      console.log(`✅ ${NEWS_SOURCES[index].name}: ${result.value.length} articles`);
    } else {
      console.error(`❌ ${NEWS_SOURCES[index].name}: Failed`);
    }
  });

  console.log(`📰 Total collected: ${allArticles.length} articles`);
  return allArticles;
}

/**
 * Remove duplicate articles based on title similarity
 */
export function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>();
  const unique: RawArticle[] = [];

  for (const article of articles) {
    // Create a normalized key from the title
    const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
    
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(article);
    }
  }

  console.log(`🔄 Removed ${articles.length - unique.length} duplicates`);
  return unique;
}
