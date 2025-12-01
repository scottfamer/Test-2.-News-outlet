import dotenv from 'dotenv';
import { runNewsPipeline } from '../scraper/pipeline.js';
import { initDatabase } from '../database/schema.js';

dotenv.config();

// Manual scraper script
console.log('🚀 Running manual scrape...\n');

// Initialize database first
await initDatabase();

runNewsPipeline()
  .then((stats) => {
    console.log('\n✅ Scrape completed successfully!');
    console.log('Final stats:', stats);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Scrape failed:', error);
    process.exit(1);
  });
