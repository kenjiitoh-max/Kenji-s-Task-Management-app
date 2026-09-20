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
