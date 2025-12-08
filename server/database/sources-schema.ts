import initSqlJs, { Database } from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: Database | null = null;

const DATABASE_PATH = process.env.DATABASE_PATH || join(__dirname, '../../data/news.db');

// Ensure data directory exists
const dataDir = dirname(DATABASE_PATH);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

export async function initSourcesDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (existsSync(DATABASE_PATH)) {
    const buffer = readFileSync(DATABASE_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create sources table
  db.run(`
    CREATE TABLE IF NOT EXISTS news_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK(type IN ('rss', 'atom', 'html', 'api', 'sitemap')),
      category TEXT,
      language TEXT DEFAULT 'en',
      country TEXT,
      credibility_score INTEGER DEFAULT 50 CHECK(credibility_score >= 0 AND credibility_score <= 100),
      is_active INTEGER DEFAULT 1 CHECK(is_active IN (0, 1)),
      is_verified INTEGER DEFAULT 0 CHECK(is_verified IN (0, 1)),
      selector TEXT,
      api_config TEXT,
      last_fetch_at INTEGER,
      last_success_at INTEGER,
      last_error TEXT,
      fetch_count INTEGER DEFAULT 0,
      success_count INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      avg_articles_per_fetch REAL DEFAULT 0,
      health_score INTEGER DEFAULT 100 CHECK(health_score >= 0 AND health_score <= 100),
      added_by TEXT DEFAULT 'system',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      metadata TEXT
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_sources_active ON news_sources(is_active)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sources_health ON news_sources(health_score)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sources_category ON news_sources(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sources_credibility ON news_sources(credibility_score)');

  saveSourcesDatabase();
  console.log('✅ Sources database initialized');
}

function getSourcesDb(): Database {
  if (!db) {
    throw new Error('Sources database not initialized');
  }
  return db;
}

function saveSourcesDatabase() {
  if (!db) return;
  const data = db.export();
  writeFileSync(DATABASE_PATH, data);
}

export interface NewsSource {
  id?: number;
  name: string;
  url: string;
  type: 'rss' | 'atom' | 'html' | 'api' | 'sitemap';
  category?: string;
  language?: string;
  country?: string;
  credibility_score?: number;
  is_active?: boolean;
  is_verified?: boolean;
  selector?: string;
  api_config?: string;
  last_fetch_at?: number;
  last_success_at?: number;
  last_error?: string;
  fetch_count?: number;
  success_count?: number;
  error_count?: number;
  avg_articles_per_fetch?: number;
  health_score?: number;
  added_by?: string;
  created_at?: number;
  updated_at?: number;
  metadata?: Record<string, any>;
}

export const sourceQueries = {
  insert: (source: NewsSource) => {
    const db = getSourcesDb();
    const now = Date.now();
    
    db.run(`
      INSERT INTO news_sources (
        name, url, type, category, language, country, credibility_score,
        is_active, is_verified, selector, api_config, health_score,
        added_by, created_at, updated_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      source.name,
      source.url,
      source.type,
      source.category || null,
      source.language || 'en',
      source.country || null,
      source.credibility_score || 50,
      source.is_active !== false ? 1 : 0,
      source.is_verified ? 1 : 0,
      source.selector || null,
      source.api_config || null,
      source.health_score || 100,
      source.added_by || 'system',
      source.created_at || now,
      now,
      source.metadata ? JSON.stringify(source.metadata) : null
    ]);
    
    saveSourcesDatabase();
  },

  getAll: (activeOnly = true, minHealthScore = 0) => {
    const db = getSourcesDb();
    let query = 'SELECT * FROM news_sources WHERE health_score >= ?';
    const params: any[] = [minHealthScore];
    
    if (activeOnly) {
      query += ' AND is_active = 1';
    }
    
    query += ' ORDER BY credibility_score DESC, health_score DESC';
    
    const stmt = db.prepare(query);
    stmt.bind(params);
    
    const results: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        ...row,
        is_active: row.is_active === 1,
        is_verified: row.is_verified === 1,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : null
      });
    }
    stmt.free();
    return results;
  },

  getById: (id: number) => {
    const db = getSourcesDb();
    const stmt = db.prepare('SELECT * FROM news_sources WHERE id = ?');
    stmt.bind([id]);
    
    let result = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      result = {
        ...row,
        is_active: row.is_active === 1,
        is_verified: row.is_verified === 1,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : null
      };
    }
    stmt.free();
    return result;
  },

  getByUrl: (url: string) => {
    const db = getSourcesDb();
    const stmt = db.prepare('SELECT * FROM news_sources WHERE url = ?');
    stmt.bind([url]);
    
    let result = null;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      result = {
        ...row,
        is_active: row.is_active === 1,
        is_verified: row.is_verified === 1,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : null
      };
    }
    stmt.free();
    return result;
  },

  update: (id: number, updates: Partial<NewsSource>) => {
    const db = getSourcesDb();
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.credibility_score !== undefined) {
      setClauses.push('credibility_score = ?');
      values.push(updates.credibility_score);
    }
    if (updates.is_active !== undefined) {
      setClauses.push('is_active = ?');
      values.push(updates.is_active ? 1 : 0);
    }
    if (updates.health_score !== undefined) {
      setClauses.push('health_score = ?');
      values.push(updates.health_score);
    }
    if (updates.last_fetch_at !== undefined) {
      setClauses.push('last_fetch_at = ?');
      values.push(updates.last_fetch_at);
    }
    if (updates.last_success_at !== undefined) {
      setClauses.push('last_success_at = ?');
      values.push(updates.last_success_at);
    }
    if (updates.last_error !== undefined) {
      setClauses.push('last_error = ?');
      values.push(updates.last_error);
    }
    if (updates.metadata !== undefined) {
      setClauses.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }

    setClauses.push('updated_at = ?');
    values.push(Date.now());

    values.push(id);

    db.run(
      `UPDATE news_sources SET ${setClauses.join(', ')} WHERE id = ?`,
      values
    );
    
    saveSourcesDatabase();
  },

  recordFetchAttempt: (id: number, success: boolean, articleCount: number = 0, error?: string) => {
    const db = getSourcesDb();
    const now = Date.now();
    
    // Get current stats
    const stmt = db.prepare('SELECT fetch_count, success_count, error_count, avg_articles_per_fetch FROM news_sources WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const fetchCount = (row.fetch_count as number) + 1;
      const successCount = (row.success_count as number) + (success ? 1 : 0);
      const errorCount = (row.error_count as number) + (success ? 0 : 1);
      const avgArticles = ((row.avg_articles_per_fetch as number) * (row.fetch_count as number) + articleCount) / fetchCount;
      
      // Calculate health score (based on success rate)
      const successRate = successCount / fetchCount;
      const healthScore = Math.round(successRate * 100);
      
      stmt.free();
      
      db.run(`
        UPDATE news_sources 
        SET last_fetch_at = ?,
            last_success_at = ?,
            last_error = ?,
            fetch_count = ?,
            success_count = ?,
            error_count = ?,
            avg_articles_per_fetch = ?,
            health_score = ?,
            updated_at = ?
        WHERE id = ?
      `, [
        now,
        success ? now : row.last_success_at,
        error || null,
        fetchCount,
        successCount,
        errorCount,
        avgArticles,
        healthScore,
        now,
        id
      ]);
      
      saveSourcesDatabase();
    } else {
      stmt.free();
    }
  },

  delete: (id: number) => {
    const db = getSourcesDb();
    db.run('DELETE FROM news_sources WHERE id = ?', [id]);
    saveSourcesDatabase();
  },

  getStats: () => {
    const db = getSourcesDb();
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
        AVG(health_score) as avg_health,
        AVG(credibility_score) as avg_credibility,
        SUM(fetch_count) as total_fetches,
        SUM(success_count) as total_successes
      FROM news_sources
    `);
    
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result;
  }
};
