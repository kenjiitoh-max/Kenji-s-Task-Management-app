import { Db } from './Db';
import { localDate, localTimestamp } from './time';
import { WorkoutSet } from './types';

export interface NewWorkoutSet {
  exercise: string;
  weight_kg: number;
  reps: number;
  sets: number;
}

export interface ExerciseBest {
  exercise: string;
  weight_kg: number;
  reps: number;
  date: string;
}

export function listWorkoutSets(db: Db, categoryId: number, date: string = localDate()): WorkoutSet[] {
  return db.getAllSync<WorkoutSet>('SELECT * FROM workout_sets WHERE category_id = ? AND date = ? ORDER BY id ASC', categoryId, date);
}

export function listWorkoutDates(db: Db, categoryId: number, limit = 30): string[] {
  return db.getAllSync<{ date: string }>('SELECT DISTINCT date FROM workout_sets WHERE category_id = ? ORDER BY date DESC LIMIT ?', categoryId, limit).map((row) => row.date);
}

export function addWorkoutSet(db: Db, categoryId: number, set: NewWorkoutSet, now = new Date()): { id: number; firstOfDay: boolean } {
  const date = localDate(now);
  let id = 0;
  let firstOfDay = false;
  db.withTransactionSync(() => {
    const existing = db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM workout_sets WHERE category_id = ? AND date = ?', categoryId, date);
    firstOfDay = (existing?.count ?? 0) === 0;
    id = db.runSync(
      'INSERT INTO workout_sets (category_id, exercise, weight_kg, reps, sets, date, performed_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      categoryId,
      set.exercise.trim(),
      set.weight_kg,
      set.reps,
      set.sets,
      date,
      localTimestamp(now),
    ).lastInsertRowId;
    if (firstOfDay) db.runSync('INSERT INTO completion_log (category_id, workout_date, completed_at) VALUES (?, ?, ?)', categoryId, date, localTimestamp(now));
  });
  return { id, firstOfDay };
}

export function deleteWorkoutSet(db: Db, id: number): void {
  const row = db.getFirstSync<{ category_id: number; date: string }>('SELECT category_id, date FROM workout_sets WHERE id = ?', id);
  if (!row) return;
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM workout_sets WHERE id = ?', id);
    const remaining = db.getFirstSync<{ count: number }>('SELECT COUNT(*) AS count FROM workout_sets WHERE category_id = ? AND date = ?', row.category_id, row.date);
    if ((remaining?.count ?? 0) === 0) db.runSync('DELETE FROM completion_log WHERE category_id = ? AND workout_date = ?', row.category_id, row.date);
  });
}

export function getExerciseBest(db: Db, categoryId: number, exercise: string): ExerciseBest | null {
  return db.getFirstSync<ExerciseBest>(
    'SELECT exercise, weight_kg, reps, date FROM workout_sets WHERE category_id = ? AND exercise = ? ORDER BY weight_kg DESC, reps DESC, id DESC LIMIT 1',
    categoryId,
    exercise,
  );
}

export function getLastSet(db: Db, categoryId: number, exercise: string): NewWorkoutSet | null {
  const last = db.getFirstSync<WorkoutSet>('SELECT * FROM workout_sets WHERE category_id = ? AND exercise = ? ORDER BY id DESC LIMIT 1', categoryId, exercise);
  return last ? { exercise, weight_kg: last.weight_kg, reps: last.reps, sets: last.sets } : null;
}

export function listExerciseBests(db: Db, categoryId: number): ExerciseBest[] {
  return db.getAllSync<ExerciseBest>(
    `SELECT w.exercise, w.weight_kg, w.reps, w.date FROM workout_sets w
     JOIN (SELECT exercise, MAX(weight_kg) AS max_weight FROM workout_sets WHERE category_id = ? GROUP BY exercise) m
       ON m.exercise = w.exercise AND m.max_weight = w.weight_kg
     WHERE w.category_id = ?
     GROUP BY w.exercise ORDER BY w.exercise ASC`,
    categoryId,
    categoryId,
  );
}

export function recentExercises(db: Db, categoryId: number, limit = 5): string[] {
  return db.getAllSync<{ exercise: string }>('SELECT exercise FROM workout_sets WHERE category_id = ? GROUP BY exercise ORDER BY MAX(id) DESC LIMIT ?', categoryId, limit).map((row) => row.exercise);
}

export function isPersonalRecord(previous: ExerciseBest | null, set: NewWorkoutSet): boolean {
  if (!previous) return set.weight_kg > 0;
  return set.weight_kg > previous.weight_kg || (set.weight_kg === previous.weight_kg && set.reps > previous.reps);
}
