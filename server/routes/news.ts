import { Router } from 'express';
import { articleQueries } from '../database/schema.js';
import { runNewsPipeline } from '../scraper/pipeline.js';

const router = Router();

/**
 * GET /api/news
 * Returns list of breaking news articles
 */
router.get('/news', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const articles = articleQueries.getAll(limit);
    
    res.json({
      success: true,
      count: articles.length,
      articles: articles.map((article: any) => ({
        id: article.id,
        headline: article.headline,
        summary: article.summary,
        sourceUrl: article.source_url,
        timestamp: article.timestamp,
        credibilityScore: article.credibility_score,
        createdAt: article.created_at,
        metadata: article.metadata ? JSON.parse(article.metadata) : null,
      })),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
    });
  }
});

/**
 * GET /api/news/:id
 * Returns full article content
 */
router.get('/news/:id', (req, res) => {
  try {
    const article = articleQueries.getById(parseInt(req.params.id));

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
      });
    }

    res.json({
      success: true,
      article: {
        id: (article as any).id,
        headline: (article as any).headline,
        summary: (article as any).summary,
        fullText: (article as any).full_text,
        sourceUrl: (article as any).source_url,
        timestamp: (article as any).timestamp,
        credibilityScore: (article as any).credibility_score,
        createdAt: (article as any).created_at,
        metadata: (article as any).metadata ? JSON.parse((article as any).metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch article',
    });
  }
});

/**
 * POST /api/scrape
 * Manually triggers the scraping pipeline
 */
router.post('/scrape', async (req, res) => {
  try {
    console.log('🔄 Manual scrape triggered');
    
    // Run pipeline asynchronously
    runNewsPipeline()
      .then((stats) => {
        console.log('✅ Manual scrape completed:', stats);
      })
      .catch((error) => {
        console.error('❌ Manual scrape failed:', error);
      });

    res.json({
      success: true,
      message: 'Scraping pipeline started',
    });
  } catch (error) {
    console.error('Error starting scrape:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start scraping',
    });
  }
});

export default router;
