import { createTestDb } from '../helpers/testDb';
import { initDatabase } from '../../src/db/database';
import { createCategory, getCategoryProgress } from '../../src/db/categories';
import { countCompletions, createDailyAction, deleteDailyAction, ensureDailyReset, listDailyActions, resetStaleCompletions, toggleDailyAction } from '../../src/db/dailyActions';
import { localDate } from '../../src/db/time';

describe('daily actions', () => {
  it('creates, toggles twice, and deletes an action', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '健康', '#00aa55');
    const id = createDailyAction(db, categoryId, '水を飲む');
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(false);
    expect(toggleDailyAction(db, id)).toBe(true);
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(true);
    expect(countCompletions(db, categoryId)).toBe(1);
    expect(toggleDailyAction(db, id)).toBe(false);
    expect(countCompletions(db, categoryId)).toBe(0);
    deleteDailyAction(db, id);
    expect(listDailyActions(db, categoryId)).toHaveLength(0);
  });

  it('keeps completion history when stale daily state resets', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '健康', '#00aa55');
    const actionId = createDailyAction(db, categoryId, '水を飲む');
    expect(toggleDailyAction(db, actionId)).toBe(true);
    const before = countCompletions(db, categoryId);
    resetStaleCompletions(db);
    expect(countCompletions(db, categoryId)).toBe(before);
  });

  it('resets yesterday-local completions and counts only today-local completions', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '健康', '#00aa55');
    const first = createDailyAction(db, categoryId, '水を飲む');
    const second = createDailyAction(db, categoryId, '歩く');
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    db.runSync(
      'UPDATE daily_actions SET is_completed = 1, completed_at = ? WHERE id = ?',
      `${localDate(yesterday)}T23:30:00`,
      first,
    );
    db.runSync(
      'UPDATE daily_actions SET is_completed = 1, completed_at = ? WHERE id = ?',
      `${localDate(now)}T23:30:00`,
      second,
    );
    resetStaleCompletions(db);
    expect(listDailyActions(db, categoryId).find((action) => action.id === first)?.is_completed).toBe(false);
    expect(listDailyActions(db, categoryId).find((action) => action.id === second)?.is_completed).toBe(true);
    expect(getCategoryProgress(db, categoryId)).toEqual({ total: 2, completed: 1 });
  });

  it('ensures reset runs once per local date', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '健康', '#00aa55');
    const actionId = createDailyAction(db, categoryId, '歩く');
    db.runSync(
      "UPDATE daily_actions SET is_completed = 1, completed_at = '2020-01-01T00:00:00' WHERE id = ?",
      actionId,
    );
    expect(ensureDailyReset(db, 'test-day')).toBe(true);
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(false);
    db.runSync(
      "UPDATE daily_actions SET is_completed = 1, completed_at = '2020-01-01T00:00:00' WHERE id = ?",
      actionId,
    );
    expect(ensureDailyReset(db, 'test-day')).toBe(false);
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(true);
    expect(ensureDailyReset(db, 'next-test-day')).toBe(true);
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(false);
  });
});
