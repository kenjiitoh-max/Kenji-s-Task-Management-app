import { Db } from './Db';
import { Goal, GoalTerm } from './types';

export function listGoals(db: Db, categoryId: number): Goal[] {
  return db.getAllSync<Goal>(
    `SELECT * FROM goals WHERE category_id = ?
     ORDER BY CASE term WHEN 'short' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`,
    categoryId,
  );
}

export function upsertGoal(
  db: Db,
  categoryId: number,
  term: GoalTerm,
  description: string,
  targetDate: string | null,
): number {
  const existing = db.getFirstSync<{ id: number }>(
    'SELECT id FROM goals WHERE category_id = ? AND term = ?',
    categoryId,
    term,
  );
  if (existing) {
    db.runSync('UPDATE goals SET description = ?, target_date = ? WHERE id = ?', description.trim(), targetDate || null, existing.id);
    return existing.id;
  }
  return db.runSync(
    'INSERT INTO goals (category_id, term, description, target_date, created_at) VALUES (?, ?, ?, ?, ?)',
    categoryId,
    term,
    description.trim(),
    targetDate || null,
    new Date().toISOString(),
  ).lastInsertRowId;
}

export function deleteGoal(db: Db, id: number): void {
  db.runSync('DELETE FROM goals WHERE id = ?', id);
}
