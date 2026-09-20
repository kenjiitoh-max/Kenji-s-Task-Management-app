import { Db } from './Db';
import { localTimestamp } from './time';
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
  const result = db.getFirstSync<{ id: number }>(
    `INSERT INTO goals (category_id, term, description, target_date, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(category_id, term) DO UPDATE SET
       description = excluded.description,
       target_date = excluded.target_date
     RETURNING id`,
    categoryId,
    term,
    description.trim(),
    targetDate || null,
    localTimestamp(),
  );
  return result?.id ?? 0;
}

export function deleteGoal(db: Db, id: number): void {
  db.runSync('DELETE FROM goals WHERE id = ?', id);
}
