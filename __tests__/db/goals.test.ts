import { createTestDb } from '../helpers/testDb';
import { initDatabase } from '../../src/db/database';
import { createCategory } from '../../src/db/categories';
import { deleteGoal, listGoals, upsertGoal } from '../../src/db/goals';

describe('goals', () => {
  it('upserts one goal per term and updates an existing goal', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '英語', '#00aaff');
    const shortId = upsertGoal(db, categoryId, 'short', '単語を覚える', '2026-10-01');
    expect(upsertGoal(db, categoryId, 'short', '毎日単語を覚える', null)).toBe(shortId);
    upsertGoal(db, categoryId, 'medium', '会話する', null);
    upsertGoal(db, categoryId, 'long', '海外で働く', null);
    expect(listGoals(db, categoryId)).toHaveLength(3);
    expect(listGoals(db, categoryId)[0].description).toBe('毎日単語を覚える');
    deleteGoal(db, shortId);
    expect(listGoals(db, categoryId)).toHaveLength(2);
  });
});
