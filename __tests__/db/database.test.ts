import { createTestDb } from '../helpers/testDb';
import { initDatabase, seedCategories } from '../../src/db/database';
import { listCategories, createCategory, deleteCategory } from '../../src/db/categories';

describe('database and categories', () => {
  it('seeds three categories idempotently', () => {
    const db = createTestDb();
    initDatabase(db);
    seedCategories(db);
    seedCategories(db);
    expect(listCategories(db)).toHaveLength(6);
    expect(listCategories(db).map((category) => category.name)).toEqual(['体重管理', 'English', 'Devin', 'Reading', 'Workout', 'Sales']);
    expect(listCategories(db).map((category) => category.color)).toEqual(['#D4A537', '#8B5FC7', '#B08BE0', '#9F7AEA', '#E2C069', '#D4A537']);
    expect(listCategories(db).map((category) => category.kind)).toEqual(['weight', 'bird', 'engineer', 'reader', 'athlete', 'sales']);
  });

  it('recolors legacy seed colors during initialization', () => {
    const db = createTestDb();
    db.execSync('CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL, created_at TEXT NOT NULL)');
    db.runSync('INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)', '体重管理', '#F97362', '2026-01-01T00:00:00');
    db.runSync('INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)', 'Other', '#F97362', '2026-01-01T00:00:00');
    initDatabase(db);
    expect(listCategories(db).find((category) => category.name === '体重管理')?.color).toBe('#D4A537');
    expect(listCategories(db).find((category) => category.name === 'Other')?.color).toBe('#F97362');
  });

  it('renames legacy seed categories to English once, keeping ids and data', () => {
    const db = createTestDb();
    db.execSync('CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL, created_at TEXT NOT NULL)');
    for (const name of ['体重管理', '英語', 'Devin', '読書', '筋トレ', '営業', '営業タスク']) {
      db.runSync('INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)', name, '#123456', '2026-01-01T00:00:00');
    }
    initDatabase(db);
    const after = listCategories(db);
    expect(after.map((category) => [category.id, category.name, category.kind])).toEqual([
      [1, '体重管理', 'weight'], [2, 'English', 'bird'], [3, 'Devin', 'engineer'], [4, 'Reading', 'reader'], [5, 'Workout', 'athlete'], [6, 'Sales', 'sales'], [7, '営業タスク', null],
    ]);
    db.runSync('UPDATE categories SET name = ? WHERE id = 2', '英語');
    initDatabase(db);
    expect(listCategories(db).find((category) => category.id === 2)?.name).toBe('英語');
  });

  it('adds Reading, Workout and Sales to an existing database once', () => {
    const db = createTestDb();
    db.execSync('CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL, created_at TEXT NOT NULL)');
    db.runSync('INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)', '読書', '#123456', '2026-01-01T00:00:00');
    initDatabase(db);
    expect(listCategories(db).map((category) => category.name)).toEqual(['Reading', 'Workout', 'Sales']);
    expect(listCategories(db).find((category) => category.name === 'Reading')?.color).toBe('#123456');
    expect(listCategories(db).map((category) => category.kind)).toEqual(['reader', 'athlete', 'sales']);
    deleteCategory(db, listCategories(db).find((category) => category.name === 'Workout')!.id);
    initDatabase(db);
    expect(listCategories(db).map((category) => category.name)).toEqual(['Reading', 'Sales']);
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
