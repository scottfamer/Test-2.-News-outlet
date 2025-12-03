import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import newsRoutes from './routes/news.js';
import { runNewsPipeline } from './scraper/pipeline.js';
import { initDatabase } from './database/schema.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize database
await initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', newsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist/client')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.warn('\n⚠️  WARNING: OPENAI_API_KEY not set!');
    console.warn('Set it in .env file to enable AI processing\n');
  }
});

// Scheduled scraping job
const SCRAPE_INTERVAL = parseInt(process.env.SCRAPE_INTERVAL_MINUTES || '15');

// Run every X minutes
cron.schedule(`*/${SCRAPE_INTERVAL} * * * *`, async () => {
  console.log(`\n⏰ Scheduled scrape triggered (every ${SCRAPE_INTERVAL} minutes)`);
  try {
    await runNewsPipeline();
  } catch (error) {
    console.error('❌ Scheduled scrape failed:', error);
  }
});

console.log(`⏰ Scheduled scraping: Every ${SCRAPE_INTERVAL} minutes`);

// Run initial scrape on startup (optional)
if (process.env.RUN_ON_STARTUP !== 'false') {
  console.log('\n🎬 Running initial scrape on startup...');
  setTimeout(() => {
    runNewsPipeline().catch((error) => {
      console.error('❌ Initial scrape failed:', error);
    });
  }, 5000); // Wait 5 seconds after startup
}

export default app;
