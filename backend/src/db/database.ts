import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../data/triage.db');

let db: SqlJsDatabase | null = null;

export async function getDatabase(): Promise<SqlJsDatabase> {
  if (!db) {
    const SQL = await initSqlJs();

    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      const uint8Array = new Uint8Array(fileBuffer);
      db = new SQL.Database(uint8Array);
    } else {
      db = new SQL.Database();
    }

    initializeDatabase(db);
    saveDatabase();
  }
  return db;
}

function initializeDatabase(database: SqlJsDatabase): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      sender_name TEXT,
      subject TEXT NOT NULL,
      body TEXT,
      snippet TEXT,
      timestamp TEXT NOT NULL,
      priority TEXT NOT NULL,
      intent TEXT NOT NULL,
      priority_emoji TEXT,
      suggested_action TEXT,
      draft_id TEXT,
      auto_reply_eligible INTEGER DEFAULT 0,
      requires_human_review INTEGER DEFAULT 0,
      review_reason TEXT,
      status TEXT DEFAULT 'triaged',
      processed_at TEXT DEFAULT (datetime('now'))
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      email_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      tone TEXT,
      quality_score REAL,
      requires_human_review INTEGER DEFAULT 1,
      review_reason TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      original_subject TEXT,
      original_sender TEXT
    )
  `);

  // Add missing columns if they don't exist (migration)
  try {
    database.run('ALTER TABLE drafts ADD COLUMN original_subject TEXT');
  } catch (e) { /* column already exists */ }
  try {
    database.run('ALTER TABLE drafts ADD COLUMN original_sender TEXT');
  } catch (e) { /* column already exists */ }

  database.run(`
    CREATE TABLE IF NOT EXISTS follow_ups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      follow_up_at TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending'
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS agent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_at TEXT DEFAULT (datetime('now')),
      emails_processed INTEGER DEFAULT 0,
      drafts_created INTEGER DEFAULT 0,
      follow_ups_scheduled INTEGER DEFAULT 0,
      errors TEXT,
      duration_seconds REAL
    )
  `);
}

export function saveDatabase(): void {
  if (db && DB_PATH) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

export function runQuery(sql: string, params: any[] = []): any[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row);
  }
  stmt.free();
  return results;
}

export function runExec(sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  const result = db.exec("SELECT last_insert_rowid() as lastId, changes() as changeCount");
  const lastId = result[0]?.values[0]?.[0] as number || 0;
  const changes = result[0]?.values[0]?.[1] as number || 0;
  return { lastInsertRowid: lastId, changes };
}