import { Router } from 'express';
import { sourceQueries, NewsSource } from '../database/sources-schema.js';
import { seedSources, discoverAndAddSources, bulkDiscoverSources } from '../services/source-discovery.js';
import { runHealthChecks, retryDisabledSources, cleanupFailedSources, getHealthReport } from '../services/source-health.js';

const router = Router();

/**
 * GET /api/sources
 * Returns list of all news sources
 */
router.get('/sources', (req, res) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const minHealth = parseInt(req.query.minHealth as string) || 0;
    
    const sources = sourceQueries.getAll(activeOnly, minHealth);
    
    res.json({
      success: true,
      count: sources.length,
      sources
    });
  } catch (error) {
    console.error('Error fetching sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sources'
    });
  }
});

/**
 * GET /api/sources/stats
 * Returns statistics about sources
 */
router.get('/sources/stats', (req, res) => {
  try {
    const stats = sourceQueries.getStats();
    const healthReport = getHealthReport();
    
    res.json({
      success: true,
      stats,
      healthReport
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/sources/:id
 * Returns a specific source
 */
router.get('/sources/:id', (req, res) => {
  try {
    const source = sourceQueries.getById(parseInt(req.params.id));
    
    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Source not found'
      });
    }
    
    res.json({
      success: true,
      source
    });
  } catch (error) {
    console.error('Error fetching source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch source'
    });
  }
});

/**
 * POST /api/sources
 * Adds a new source manually
 */
router.post('/sources', (req, res) => {
  try {
    const source: NewsSource = {
      name: req.body.name,
      url: req.body.url,
      type: req.body.type || 'rss',
      category: req.body.category,
      language: req.body.language || 'en',
      country: req.body.country,
      credibility_score: req.body.credibility_score || 50,
      is_active: req.body.is_active !== false,
      is_verified: req.body.is_verified || false,
      selector: req.body.selector,
      api_config: req.body.api_config,
      added_by: 'manual'
    };
    
    // Check if source already exists
    const existing = sourceQueries.getByUrl(source.url);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Source with this URL already exists'
      });
    }
    
    sourceQueries.insert(source);
    
    res.json({
      success: true,
      message: 'Source added successfully'
    });
  } catch (error) {
    console.error('Error adding source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add source'
    });
  }
});

/**
 * PUT /api/sources/:id
 * Updates a source
 */
router.put('/sources/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Partial<NewsSource> = {};
    
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.credibility_score !== undefined) updates.credibility_score = req.body.credibility_score;
    if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
    if (req.body.is_verified !== undefined) updates.is_verified = req.body.is_verified;
    if (req.body.category !== undefined) updates.category = req.body.category;
    
    sourceQueries.update(id, updates);
    
    res.json({
      success: true,
      message: 'Source updated successfully'
    });
  } catch (error) {
    console.error('Error updating source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update source'
    });
  }
});

/**
 * DELETE /api/sources/:id
 * Deletes a source
 */
router.delete('/sources/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    sourceQueries.delete(id);
    
    res.json({
      success: true,
      message: 'Source deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete source'
    });
  }
});

/**
 * POST /api/sources/seed
 * Seeds the database with initial sources
 */
router.post('/sources/seed', async (req, res) => {
  try {
    const result = await seedSources();
    
    res.json({
      success: true,
      message: 'Sources seeded successfully',
      result
    });
  } catch (error) {
    console.error('Error seeding sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed sources'
    });
  }
});

/**
 * POST /api/sources/discover
 * Discovers sources from a website
 */
router.post('/sources/discover', async (req, res) => {
  try {
    const { websiteUrl, sourceName, category } = req.body;
    
    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: 'websiteUrl is required'
      });
    }
    
    const result = await discoverAndAddSources(websiteUrl, sourceName, category);
    
    res.json({
      success: true,
      message: 'Discovery complete',
      result
    });
  } catch (error) {
    console.error('Error discovering sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover sources'
    });
  }
});

/**
 * POST /api/sources/discover/bulk
 * Discovers sources from multiple websites
 */
router.post('/sources/discover/bulk', async (req, res) => {
  try {
    const { websites } = req.body;
    
    if (!Array.isArray(websites) || websites.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'websites array is required'
      });
    }
    
    const result = await bulkDiscoverSources(websites);
    
    res.json({
      success: true,
      message: 'Bulk discovery complete',
      result
    });
  } catch (error) {
    console.error('Error in bulk discovery:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to discover sources'
    });
  }
});

/**
 * POST /api/sources/health-check
 * Runs health checks on all sources
 */
router.post('/sources/health-check', async (req, res) => {
  try {
    const result = await runHealthChecks();
    
    res.json({
      success: true,
      message: 'Health checks complete',
      result
    });
  } catch (error) {
    console.error('Error running health checks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run health checks'
    });
  }
});

/**
 * POST /api/sources/retry-disabled
 * Retries disabled sources
 */
router.post('/sources/retry-disabled', async (req, res) => {
  try {
    const result = await retryDisabledSources();
    
    res.json({
      success: true,
      message: 'Retry complete',
      result
    });
  } catch (error) {
    console.error('Error retrying sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry sources'
    });
  }
});

/**
 * POST /api/sources/cleanup
 * Cleans up failed sources
 */
router.post('/sources/cleanup', async (req, res) => {
  try {
    const result = await cleanupFailedSources();
    
    res.json({
      success: true,
      message: 'Cleanup complete',
      result
    });
  } catch (error) {
    console.error('Error cleaning up sources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup sources'
    });
  }
});

export default router;
