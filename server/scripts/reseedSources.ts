import { initDatabase } from '../database/schema.js';
import { initSourcesDatabase, sourceQueries } from '../database/sources-schema.js';
import { seedSources } from '../services/source-discovery.js';

/**
 * Clears all sources and reseeds with the exclusive user-specified list
 */
async function reseedSources() {
  console.log('🔄 Starting source reseed...\n');
  
  // Initialize databases
  await initDatabase();
  await initSourcesDatabase();
  
  // Get all existing sources
  const existingSources = sourceQueries.getAll(false, 0);
  console.log(`📊 Found ${existingSources.length} existing sources`);
  
  // Delete all existing sources
  for (const source of existingSources) {
    sourceQueries.delete(source.id as number);
  }
  console.log('🗑️  Cleared all existing sources\n');
  
  // Seed with the new exclusive list
  const result = await seedSources();
  
  console.log('\n✅ Reseed complete!');
  console.log(`   Added: ${result.added} sources`);
  console.log(`   Skipped: ${result.skipped} sources`);
  
  // Show final count
  const finalSources = sourceQueries.getAll(false, 0);
  console.log(`\n📊 Total sources now: ${finalSources.length}`);
  
  process.exit(0);
}

reseedSources().catch((error) => {
  console.error('❌ Error reseeding sources:', error);
  process.exit(1);
});
