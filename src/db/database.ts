import type { SQLiteDatabase } from 'expo-sqlite';
import { Db } from './Db';
import { localTimestamp } from './time';
import { CategoryKind } from './types';

let database: SQLiteDatabase | null = null;

export function getDb(): SQLiteDatabase {
  if (!database) {
    const SQLite = require('expo-sqlite') as typeof import('expo-sqlite');
    database = SQLite.openDatabaseSync('taskapp.db');
  }
  return database;
}

export function initDatabase(db: Db): void {
  db.execSync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      term TEXT NOT NULL CHECK(term IN ('short', 'medium', 'long')),
      description TEXT NOT NULL,
      target_date TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(category_id, term)
    );
    CREATE TABLE IF NOT EXISTS daily_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS body_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      weight_kg REAL NOT NULL,
      body_fat_pct REAL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS completion_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      action_id INTEGER,
      completed_at TEXT NOT NULL
    );
  `);
  migrateCategoryKind(db);
}

const defaultKinds: Record<string, CategoryKind> = { 体重管理: 'weight', 英語: 'bird', Devin: 'engineer' };

function migrateCategoryKind(db: Db): void {
  const columns = db.getAllSync<{ name: string }>('PRAGMA table_info(categories)');
  if (!columns.some((column) => column.name === 'kind')) {
    db.execSync('ALTER TABLE categories ADD COLUMN kind TEXT');
  }
  for (const [name, kind] of Object.entries(defaultKinds)) {
    db.runSync('UPDATE categories SET kind = ? WHERE kind IS NULL AND name = ?', kind, name);
  }
}

export function seedCategories(db: Db): void {
  const count = db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM categories');
  if (!count || count.count > 0) return;
  const now = localTimestamp();
  const seeds: [string, string, CategoryKind][] = [
    ['体重管理', '#F97362', 'weight'],
    ['英語', '#3B82F6', 'bird'],
    ['Devin', '#8B5CF6', 'engineer'],
  ];
  for (const [name, color, kind] of seeds) {
    db.runSync('INSERT INTO categories (name, color, kind, created_at) VALUES (?, ?, ?, ?)', name, color, kind, now);
  }
}
