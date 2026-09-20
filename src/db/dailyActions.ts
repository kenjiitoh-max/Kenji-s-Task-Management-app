import { currentStreak } from '../growth/history';
import { Db } from './Db';
import { localDate, localTimestamp } from './time';
import { DailyAction } from './types';

let lastResetDate: string | null = null;

type ActionRow = Omit<DailyAction, 'is_completed'> & { is_completed: number };

const mapAction = (row: ActionRow): DailyAction => ({
  ...row,
  is_completed: Boolean(row.is_completed),
});

export function listDailyActions(db: Db, categoryId: number): DailyAction[] {
  return db.getAllSync<ActionRow>(
    'SELECT * FROM daily_actions WHERE category_id = ? ORDER BY id',
    categoryId,
  ).map(mapAction);
}

export function createDailyAction(db: Db, categoryId: number, title: string): number {
  const now = localTimestamp();
  return db.runSync(
    'INSERT INTO daily_actions (category_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
    categoryId,
    title.trim(),
    now,
    now,
  ).lastInsertRowId;
}

export function toggleDailyAction(db: Db, id: number): boolean {
  const current = db.getFirstSync<{ is_completed: number; category_id: number }>(
    'SELECT is_completed, category_id FROM daily_actions WHERE id = ?',
    id,
  );
  if (!current) return false;
  const completed = !Boolean(current.is_completed);
  const now = localTimestamp();
  db.withTransactionSync(() => {
    db.runSync(
      'UPDATE daily_actions SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?',
      completed ? 1 : 0,
      completed ? now : null,
      now,
      id,
    );
    if (completed) {
      db.runSync('INSERT INTO completion_log (category_id, action_id, completed_at) VALUES (?, ?, ?)', current.category_id, id, now);
    } else {
      db.runSync(
        'DELETE FROM completion_log WHERE id = (SELECT id FROM completion_log WHERE action_id = ? ORDER BY id DESC LIMIT 1)',
        id,
      );
    }
  });
  return completed;
}

export function deleteDailyAction(db: Db, id: number): void {
  db.runSync('DELETE FROM daily_actions WHERE id = ?', id);
}

export function countCompletions(db: Db, categoryId: number): number {
  const row = db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM completion_log WHERE category_id = ?', categoryId);
  return row?.count ?? 0;
}

export function listCompletionDates(db: Db, categoryId: number): string[] {
  return db.getAllSync<{ completed_at: string }>(
    'SELECT completed_at FROM completion_log WHERE category_id = ? ORDER BY completed_at ASC, id ASC',
    categoryId,
  ).map((row) => row.completed_at);
}

export function listActionCompletionDates(db: Db, actionId: number): string[] {
  return db.getAllSync<{ completed_at: string }>(
    'SELECT completed_at FROM completion_log WHERE action_id = ? ORDER BY completed_at ASC, id ASC',
    actionId,
  ).map((row) => row.completed_at);
}

export function listActionStreaks(db: Db, categoryId: number): { id: number; title: string; streak: number }[] {
  const today = localDate();
  return listDailyActions(db, categoryId)
    .map((action) => ({
      id: action.id,
      title: action.title,
      streak: currentStreak(listActionCompletionDates(db, action.id), today),
    }))
    .sort((a, b) => b.streak - a.streak || a.id - b.id);
}

export function resetStaleCompletions(db: Db): void {
  const date = `${localDate()}%`;
  db.runSync(
    `UPDATE daily_actions SET is_completed = 0, completed_at = NULL, updated_at = ?
     WHERE is_completed = 1 AND (completed_at IS NULL OR completed_at NOT LIKE ?)`,
    localTimestamp(),
    date,
  );
}

export function ensureDailyReset(db: Db, today = localDate()): boolean {
  if (lastResetDate === today) return false;
  resetStaleCompletions(db);
  lastResetDate = today;
  return true;
}
