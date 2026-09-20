import { createTestDb } from '../helpers/testDb';
import { initDatabase } from '../../src/db/database';
import { createCategory, getCategoryProgress } from '../../src/db/categories';
import { createDailyAction, deleteDailyAction, listDailyActions, resetStaleCompletions, toggleDailyAction } from '../../src/db/dailyActions';

describe('daily actions', () => {
  it('creates, toggles twice, and deletes an action', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '健康', '#00aa55');
    const id = createDailyAction(db, categoryId, '水を飲む');
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(false);
    expect(toggleDailyAction(db, id)).toBe(true);
    expect(listDailyActions(db, categoryId)[0].is_completed).toBe(true);
    expect(toggleDailyAction(db, id)).toBe(false);
    deleteDailyAction(db, id);
    expect(listDailyActions(db, categoryId)).toHaveLength(0);
  });

  it('counts progress and resets yesterday completions', () => {
    const db = createTestDb();
    initDatabase(db);
    const categoryId = createCategory(db, '健康', '#00aa55');
    const first = createDailyAction(db, categoryId, '水を飲む');
    const second = createDailyAction(db, categoryId, '歩く');
    toggleDailyAction(db, first);
    toggleDailyAction(db, second);
    expect(getCategoryProgress(db, categoryId)).toEqual({ total: 2, completed: 2 });
    db.runSync(
      "UPDATE daily_actions SET is_completed = 1, completed_at = '2020-01-01T00:00:00.000Z' WHERE id = ?",
      first,
    );
    resetStaleCompletions(db);
    expect(listDailyActions(db, categoryId).find((action) => action.id === first)?.is_completed).toBe(false);
    expect(getCategoryProgress(db, categoryId)).toEqual({ total: 2, completed: 1 });
  });
});
