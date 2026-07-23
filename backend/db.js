/**
 * db.js — SQLite database using sql.js (pure JavaScript, no C++ compilation needed)
 * Loads the DB from disk on startup, writes it back after every change.
 */
const path = require('path');
const fs   = require('fs');

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp/data' : path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'orders.db');

let _db = null;

// ─── Persist to disk ──────────────────────────────────────────────────────────
const saveDb = () => {
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

// ─── Convert sql.js result → array of plain objects ───────────────────────────
const toObjects = (results) => {
  if (!results || results.length === 0) return [];
  const { columns, values } = results[0];
  return values.map(row =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
};

// ─── Run a single query and return last insert rowid ─────────────────────────
const run = (sql, params = []) => {
  _db.run(sql, params);
  const [{ values }] = _db.exec('SELECT last_insert_rowid() AS id');
  return values[0][0];
};

// ─── Query helpers ────────────────────────────────────────────────────────────
const all = (sql, params = []) => {
  const stmt = _db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
};

const get = (sql, params = []) => all(sql, params)[0] || null;

// ─── Transaction helper ───────────────────────────────────────────────────────
const transaction = (fn) => {
  _db.run('BEGIN');
  try {
    const result = fn();
    _db.run('COMMIT');
    saveDb();
    return result;
  } catch (err) {
    _db.run('ROLLBACK');
    throw err;
  }
};

// ─── Init (async — sql.js needs to load WASM) ────────────────────────────────
const initDb = async () => {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  _db.run('PRAGMA foreign_keys = ON');

  _db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT    NOT NULL,
      phone         TEXT    NOT NULL,
      email         TEXT    NOT NULL,
      address       TEXT    NOT NULL,
      delivery_zone TEXT    NOT NULL DEFAULT 'inside',
      gift_message  TEXT,
      total_amount  REAL    NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'pending',
      created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `);

  _db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_name TEXT    NOT NULL,
      quantity     INTEGER NOT NULL,
      unit_price   REAL    NOT NULL
    )
  `);

  saveDb();
  console.log('✅ Database ready →', DB_PATH);
};

module.exports = { initDb, run, all, get, transaction, saveDb };
