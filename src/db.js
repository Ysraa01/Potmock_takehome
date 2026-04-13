const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.POTMOCK_DB || path.join(__dirname, '..', 'potmock.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const SCHEMA_POTS = `CREATE TABLE IF NOT EXISTS pots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  closing_date TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

const SCHEMA_CONTRIBS = `CREATE TABLE IF NOT EXISTS contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pot_id INTEGER NOT NULL,
  contributor_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  card_last4 TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pot_id) REFERENCES pots(id)
)`;

function initSchema() {
  db.prepare(SCHEMA_POTS).run();
  db.prepare(SCHEMA_CONTRIBS).run();
}

function wipe() {
  db.prepare('DELETE FROM contributions').run();
  db.prepare('DELETE FROM pots').run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('pots','contributions')").run();
}

function seed() {
  const insertPot = db.prepare(
    'INSERT INTO pots (title, event_type, closing_date, recipient_name) VALUES (?, ?, ?, ?)'
  );
  const insertContribution = db.prepare(
    'INSERT INTO contributions (pot_id, contributor_name, amount, card_last4) VALUES (?, ?, ?, ?)'
  );

  const future = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const past = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const a = insertPot.run("Sarah's Wedding", 'wedding', future, 'Sarah Miller').lastInsertRowid;
  const b = insertPot.run("Dad's Retirement", 'retirement', future, 'Robert Kim').lastInsertRowid;
  const c = insertPot.run('Anna Birthday', 'birthday', past, 'Anna Novak').lastInsertRowid;

  insertContribution.run(a, 'Alex', 5000, '1111');
  insertContribution.run(a, 'Priya', 3000, '2222');
  insertContribution.run(b, 'Linda', 10000, '3333');
  insertContribution.run(c, 'Tom', 2000, '4444');
}

function reset() {
  wipe();
  seed();
}

initSchema();
reset();

module.exports = { db, reset };
