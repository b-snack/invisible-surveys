import Database from 'better-sqlite3';

const db = new Database('./sessions.db');

// Create tables immediately
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    page_url TEXT
  );
  
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    data TEXT,
    FOREIGN KEY(session_id) REFERENCES sessions(id)
  );
`);

export default db;
