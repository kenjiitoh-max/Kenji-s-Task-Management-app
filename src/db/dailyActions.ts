import { Db } from './Db';
import { localDate, localTimestamp } from './time';
import { DailyAction } from './types';

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
  const current = db.getFirstSync<{ is_completed: number }>(
    'SELECT is_completed FROM daily_actions WHERE id = ?',
    id,
  );
  if (!current) return false;
  const completed = !Boolean(current.is_completed);
  db.runSync(
    'UPDATE daily_actions SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?',
    completed ? 1 : 0,
    completed ? localTimestamp() : null,
    localTimestamp(),
    id,
  );
  return completed;
}

export function deleteDailyAction(db: Db, id: number): void {
  db.runSync('DELETE FROM daily_actions WHERE id = ?', id);
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
