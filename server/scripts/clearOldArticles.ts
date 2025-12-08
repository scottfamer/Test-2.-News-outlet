import { initDatabase, articleQueries } from '../database/schema.js';

/**
 * Clears all articles from the database
 * Run this after reseeding sources to remove articles from old/removed sources
 */
async function clearOldArticles() {
  console.log('🗑️  Starting article cleanup...\n');
  
  // Initialize database
  await initDatabase();
  
  // Get all articles
  const allArticles = articleQueries.getAll(1000);
  console.log(`📊 Found ${allArticles.length} existing articles`);
  
  // Delete all articles
  let deleted = 0;
  for (const article of allArticles) {
    try {
      articleQueries.delete(article.id);
      deleted++;
    } catch (error) {
      console.error(`Error deleting article ${article.id}:`, error);
    }
  }
  
  console.log(`\n✅ Cleared ${deleted} articles`);
  console.log('💡 Next scrape will populate with fresh articles from your 60 sources\n');
  
  process.exit(0);
}

clearOldArticles().catch((error) => {
  console.error('❌ Error clearing articles:', error);
  process.exit(1);
});
