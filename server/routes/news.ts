import { Router } from 'express';
import { articleQueries, Article } from '../database/schema.js';
import { runNewsPipeline } from '../scraper/pipeline.js';
import { generateTTS, getTTSCache } from '../services/tts.js';

const router = Router();

/**
 * GET /api/news
 * Returns list of breaking news articles
 */
router.get('/news', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 12;
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

/**
 * DELETE /api/news
 * Clears all articles from the database
 * Useful after reseeding sources to remove articles from old sources
 */
router.delete('/news', async (req, res) => {
  try {
    console.log('🗑️  Clearing all articles...');
    
    const allArticles = articleQueries.getAll(1000);
    let deleted = 0;
    
    for (const article of allArticles) {
      try {
        if (typeof article.id === 'number') {
          articleQueries.delete(article.id);
          deleted++;
        }
      } catch (error) {
        console.error(`Error deleting article ${article.id}:`, error);
      }
    }
    
    console.log(`✅ Cleared ${deleted} articles`);
    
    res.json({
      success: true,
      message: 'All articles cleared',
      deleted
    });
  } catch (error) {
    console.error('Error clearing articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear articles'
    });
  }
});

/**
 * GET /api/news/:id/tts
 * Generate text-to-speech audio for an article
 * Returns audio stream or cached audio URL
 */
router.get('/news/:id/tts', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id);
    
    // Check if we have cached TTS
    const cached = getTTSCache(articleId);
    if (cached) {
      return res.json({
        success: true,
        cached: true,
        audioUrl: cached
      });
    }
    
    // Get the article
    const article = articleQueries.getById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }
    
    // Generate TTS
    const audioBuffer = await generateTTS(
      articleId,
      (article as any).headline,
      (article as any).summary,
      (article as any).full_text
    );
    
    // Send audio as response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate audio'
    });
  }
});

export default router;
