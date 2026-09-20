import { createTestDb } from '../helpers/testDb';
import { initDatabase, seedCategories } from '../../src/db/database';
import { listCategories, createCategory, deleteCategory } from '../../src/db/categories';

describe('database and categories', () => {
  it('seeds three categories idempotently', () => {
    const db = createTestDb();
    initDatabase(db);
    seedCategories(db);
    seedCategories(db);
    expect(listCategories(db)).toHaveLength(3);
    expect(listCategories(db).map((category) => category.name)).toEqual(['体重管理', '英語', 'Devin']);
    expect(listCategories(db).map((category) => category.color)).toEqual(['#F8B7A8', '#A9C9F5', '#C9B8F0']);
  });

  it('recolors legacy seed colors during initialization', () => {
    const db = createTestDb();
    db.execSync('CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL, created_at TEXT NOT NULL)');
    db.runSync('INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)', '体重管理', '#F97362', '2026-01-01T00:00:00');
    db.runSync('INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)', 'Other', '#F97362', '2026-01-01T00:00:00');
    initDatabase(db);
    expect(listCategories(db).find((category) => category.name === '体重管理')?.color).toBe('#F8B7A8');
    expect(listCategories(db).find((category) => category.name === 'Other')?.color).toBe('#F97362');
  });

  it('creates, lists, and deletes categories', () => {
    const db = createTestDb();
    initDatabase(db);
    const id = createCategory(db, '読書', '#123456');
    expect(listCategories(db)).toHaveLength(1);
    deleteCategory(db, id);
    expect(listCategories(db)).toHaveLength(0);
  });
});
