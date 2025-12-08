import { sourceQueries } from '../database/sources-schema.js';

/**
 * Runs health checks on all active sources
 * Disables sources that consistently fail
 */
export async function runHealthChecks() {
  console.log('🏥 Running source health checks...');
  
  const sources = sourceQueries.getAll(true, 0); // Get all active sources
  let updated = 0;
  let disabled = 0;
  
  for (const source of sources) {
    try {
      const healthScore = source.health_score as number;
      const fetchCount = source.fetch_count as number;
      
      // Disable sources with very low health scores after sufficient attempts
      if (fetchCount >= 10 && healthScore < 20) {
        sourceQueries.update(source.id as number, {
          is_active: false,
          metadata: {
            ...(source.metadata || {}),
            disabled_reason: 'Low health score',
            disabled_at: Date.now()
          }
        });
        disabled++;
        console.log(`❌ Disabled source: ${source.name} (health: ${healthScore}%)`);
      }
      
      // Warn about sources with declining health
      else if (healthScore < 50 && fetchCount >= 5) {
        console.log(`⚠️  Warning: ${source.name} has declining health (${healthScore}%)`);
        updated++;
      }
      
      // Boost credibility for consistently reliable sources
      else if (healthScore >= 95 && fetchCount >= 20) {
        const currentCredibility = source.credibility_score as number;
        if (currentCredibility < 90) {
          sourceQueries.update(source.id as number, {
            credibility_score: Math.min(currentCredibility + 5, 95)
          });
          updated++;
          console.log(`✅ Increased credibility for: ${source.name}`);
        }
      }
    } catch (error) {
      console.error(`Error checking source ${source.name}:`, error);
    }
  }
  
  console.log(`🏥 Health checks complete: ${updated} updated, ${disabled} disabled`);
  return { updated, disabled };
}

/**
 * Re-enables sources that were previously disabled but may have recovered
 */
export async function retryDisabledSources() {
  console.log('🔄 Checking disabled sources...');
  
  const allSources = sourceQueries.getAll(false, 0); // Get all sources including inactive
  const disabled = allSources.filter((s: any) => s.is_active === false);
  
  let reEnabled = 0;
  
  for (const source of disabled) {
    try {
      const disabledAt = source.metadata?.disabled_at;
      const now = Date.now();
      const daysSinceDisabled = disabledAt ? (now - disabledAt) / (1000 * 60 * 60 * 24) : 999;
      
      // Retry sources that have been disabled for more than 7 days
      if (daysSinceDisabled >= 7) {
        sourceQueries.update(source.id as number, {
          is_active: true,
          health_score: 50, // Reset to neutral
          metadata: {
            ...(source.metadata || {}),
            re_enabled_at: now,
            retry_count: (source.metadata?.retry_count || 0) + 1
          }
        });
        reEnabled++;
        console.log(`🔄 Re-enabled source for retry: ${source.name}`);
      }
    } catch (error) {
      console.error(`Error retrying source ${source.name}:`, error);
    }
  }
  
  console.log(`🔄 Re-enabled ${reEnabled} sources for retry`);
  return { reEnabled };
}

/**
 * Cleans up sources that have been failing for too long
 */
export async function cleanupFailedSources() {
  console.log('🧹 Cleaning up failed sources...');
  
  const allSources = sourceQueries.getAll(false, 0);
  let removed = 0;
  
  for (const source of allSources) {
    try {
      const healthScore = source.health_score as number;
      const fetchCount = source.fetch_count as number;
      const isVerified = source.is_verified as boolean;
      const retryCount = source.metadata?.retry_count || 0;
      
      // Remove unverified sources that have failed consistently across multiple retries
      if (!isVerified && healthScore < 10 && fetchCount >= 20 && retryCount >= 3) {
        sourceQueries.delete(source.id as number);
        removed++;
        console.log(`🗑️  Removed failed source: ${source.name}`);
      }
    } catch (error) {
      console.error(`Error cleaning up source ${source.name}:`, error);
    }
  }
  
  console.log(`🧹 Cleanup complete: ${removed} sources removed`);
  return { removed };
}

/**
 * Gets a health report for all sources
 */
export function getHealthReport() {
  const stats = sourceQueries.getStats();
  const allSources = sourceQueries.getAll(false, 0);
  
  const healthBuckets = {
    excellent: allSources.filter((s: any) => s.health_score >= 90).length,
    good: allSources.filter((s: any) => s.health_score >= 70 && s.health_score < 90).length,
    fair: allSources.filter((s: any) => s.health_score >= 50 && s.health_score < 70).length,
    poor: allSources.filter((s: any) => s.health_score < 50).length
  };
  
  const totalFetches = Number(stats.total_fetches) || 0;
  const totalSuccesses = Number(stats.total_successes) || 0;
  
  return {
    total: Number(stats.total) || 0,
    active: Number(stats.active) || 0,
    verified: Number(stats.verified) || 0,
    avgHealth: Math.round(Number(stats.avg_health) || 0),
    avgCredibility: Math.round(Number(stats.avg_credibility) || 0),
    totalFetches,
    totalSuccesses,
    successRate: totalFetches > 0 
      ? Math.round((totalSuccesses / totalFetches) * 100) 
      : 0,
    healthDistribution: healthBuckets
  };
}
