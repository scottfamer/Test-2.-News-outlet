import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DB_DIR, 'news.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: SqlJsDatabase;
let initialized = false;

// Initialize SQL.js
export async function initDatabase(): Promise<void> {
  if (initialized) return;

  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create articles table
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headline TEXT NOT NULL,
      summary TEXT NOT NULL,
      full_text TEXT NOT NULL,
      source_url TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      credibility_score INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      metadata TEXT,
      is_breaking INTEGER DEFAULT 1,
      UNIQUE(headline, source_url)
    )
  `);

  // Create index for timestamp-based queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_articles_timestamp 
    ON articles(timestamp DESC)
  `);

  // Create index for breaking news
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_articles_breaking 
    ON articles(is_breaking, timestamp DESC)
  `);

  initialized = true;
  console.log('✅ Database initialized at:', DB_PATH);
}

// Save database to file
export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, data);
}

// Get database instance
export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export interface Article {
  id?: number;
  headline: string;
  summary: string;
  full_text: string;
  source_url: string;
  timestamp: number;
  credibility_score: number;
  created_at: number;
  metadata?: string;
  is_breaking?: boolean;
}

export const articleQueries = {
  insert: (headline: string, summary: string, fullText: string, sourceUrl: string, 
           timestamp: number, credibilityScore: number, createdAt: number, 
           metadata: string, isBreaking: number) => {
    const db = getDb();
    db.run(
      `INSERT INTO articles (
        headline, summary, full_text, source_url, 
        timestamp, credibility_score, created_at, metadata, is_breaking
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [headline, summary, fullText, sourceUrl, timestamp, credibilityScore, createdAt, metadata, isBreaking]
    );
    saveDatabase();
  },

  getAll: (limit: number) => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM articles 
      WHERE is_breaking = 1 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    stmt.bind([limit]);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  },

  getById: (id: number) => {
    const db = getDb();
    const stmt = db.prepare(`SELECT * FROM articles WHERE id = ?`);
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  },

  deleteOld: (timestamp: number) => {
    const db = getDb();
    db.run(`DELETE FROM articles WHERE timestamp < ?`, [timestamp]);
    saveDatabase();
    return { changes: db.getRowsModified() };
  },

  checkDuplicate: (headline: string, sourceUrl: string) => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT id FROM articles 
      WHERE headline = ? OR source_url = ?
      LIMIT 1
    `);
    stmt.bind([headline, sourceUrl]);
    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();
    return result;
  },
};
