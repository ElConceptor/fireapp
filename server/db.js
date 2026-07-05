const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const CONTRACT_PATH = path.resolve(__dirname, '..', 'src', 'data', 'prototype-data.json');

function loadContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
}

function openDatabase(dbPath) {
  const resolvedPath = dbPath || process.env.DB_PATH || path.resolve(__dirname, '..', 'data', 'app.db');

  if (resolvedPath !== ':memory:') {
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
  }

  const db = new DatabaseSync(resolvedPath);

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'operator', 'viewer')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tenant_modules (
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      module_id TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      autonomy TEXT NOT NULL DEFAULT 'assisted',
      PRIMARY KEY (tenant_id, module_id)
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_events(tenant_id, id DESC);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
  `);

  return db;
}

function recordAudit(db, tenantId, actor, action) {
  db.prepare('INSERT INTO audit_events (tenant_id, actor, action) VALUES (?, ?, ?)').run(tenantId, actor, action);
}

module.exports = { openDatabase, loadContract, recordAudit };
