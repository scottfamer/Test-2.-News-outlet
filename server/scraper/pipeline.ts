import { collectArticles, deduplicateArticles, RawArticle } from './collector.js';
import { processArticleWithAI } from '../ai/processor.js';
import { articleQueries, Article, saveDatabase } from '../database/schema.js';

export interface PipelineStats {
  collected: number;
  deduplicated: number;
  processed: number;
  saved: number;
  failed: number;
  duration: number;
}

/**
 * Main AI-powered news processing pipeline
 */
export async function runNewsPipeline(): Promise<PipelineStats> {
  const startTime = Date.now();
  const stats: PipelineStats = {
    collected: 0,
    deduplicated: 0,
    processed: 0,
    saved: 0,
    failed: 0,
    duration: 0,
  };

  try {
    console.log('\n🚀 Starting AI News Pipeline...\n');

    // Step 1: Collect articles from all sources
    const rawArticles = await collectArticles();
    stats.collected = rawArticles.length;

    if (rawArticles.length === 0) {
      console.log('⚠️  No articles collected');
      return stats;
    }

    // Step 2: Deduplicate
    const uniqueArticles = deduplicateArticles(rawArticles);
    stats.deduplicated = uniqueArticles.length;

    // Step 3: Process with AI (in batches to avoid rate limits)
    console.log('\n🤖 Processing articles with AI...\n');
    const batchSize = 5;
    const processedArticles: Array<Article & { raw: RawArticle }> = [];

    for (let i = 0; i < uniqueArticles.length; i += batchSize) {
      const batch = uniqueArticles.slice(i, i + batchSize);
      
      const promises = batch.map(async (rawArticle) => {
        try {
          // Check if already exists
          const existing = articleQueries.checkDuplicate(
            rawArticle.title,
            rawArticle.url
          );

          if (existing) {
            console.log(`⏭️  Skipping duplicate: ${rawArticle.title.substring(0, 50)}...`);
            return null;
          }

          // Process with AI
          const processed = await processArticleWithAI(
            `${rawArticle.title}\n\n${rawArticle.content}`,
            rawArticle.url
          );

          if (!processed || !processed.isBreakingNews) {
            console.log(`❌ Not breaking news: ${rawArticle.title.substring(0, 50)}...`);
            return null;
          }

          console.log(`✅ Processed: ${processed.headline.substring(0, 60)}...`);
          stats.processed++;

          return {
            headline: processed.headline,
            summary: processed.summary,
            full_text: processed.fullText,
            source_url: rawArticle.url,
            timestamp: rawArticle.publishedAt.getTime(),
            credibility_score: processed.credibilityScore,
            created_at: Date.now(),
            metadata: JSON.stringify({
              source: rawArticle.source,
              originalTitle: rawArticle.title,
            }),
            is_breaking: true,
            raw: rawArticle,
          };
        } catch (error) {
          console.error(`❌ Error processing article:`, error);
          stats.failed++;
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter(a => a !== null) as (Article & { raw: RawArticle })[];
processedArticles.push(...validResults);

      // Small delay to avoid rate limits
      if (i + batchSize < uniqueArticles.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Step 4: Save to database
    console.log('\n💾 Saving to database...\n');
    
    for (const article of processedArticles) {
      try {
        articleQueries.insert(
          article.headline,
          article.summary,
          article.full_text,
          article.source_url,
          article.timestamp,
          article.credibility_score,
          article.created_at,
          article.metadata || '',
          article.is_breaking ? 1 : 0
        );
        stats.saved++;
        console.log(`💾 Saved: ${article.headline.substring(0, 60)}...`);
      } catch (error) {
        console.error(`❌ Error saving article:`, error);
      }
    }

    // Clean up old articles (older than 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const deleteResult = articleQueries.deleteOld(sevenDaysAgo);
    console.log(`🗑️  Deleted ${deleteResult.changes} old articles`);

    stats.duration = Date.now() - startTime;

    console.log('\n✅ Pipeline complete!\n');
    console.log('📊 Stats:', {
      ...stats,
      duration: `${(stats.duration / 1000).toFixed(2)}s`,
    });

    return stats;
  } catch (error) {
    console.error('❌ Pipeline error:', error);
    stats.duration = Date.now() - startTime;
    return stats;
  }
}
