import { createCategory } from '../../src/db/categories';
import { countCompletions } from '../../src/db/dailyActions';
import { initDatabase } from '../../src/db/database';
import { addWorkoutSet, deleteWorkoutSet, getExerciseBest, isPersonalRecord, listExerciseBests, listWorkoutDates, listWorkoutSets, recentExercises } from '../../src/db/workouts';
import { exercises, findExercise } from '../../src/workout/exercises';
import { createTestDb } from '../helpers/testDb';

const day1 = new Date(2026, 8, 20, 7, 0, 0);
const day2 = new Date(2026, 8, 21, 7, 0, 0);

function setup() {
  const db = createTestDb();
  initDatabase(db);
  return { db, category: createCategory(db, '筋トレ', '#000000') };
}

describe('workouts', () => {
  it('logs sets per day and awards one completion per training day', () => {
    const { db, category } = setup();
    expect(addWorkoutSet(db, category, { exercise: 'ベンチプレス', weight_kg: 60, reps: 10, sets: 3 }, day1).firstOfDay).toBe(true);
    expect(addWorkoutSet(db, category, { exercise: 'スクワット', weight_kg: 80, reps: 8, sets: 3 }, day1).firstOfDay).toBe(false);
    expect(countCompletions(db, category)).toBe(1);
    addWorkoutSet(db, category, { exercise: 'ベンチプレス', weight_kg: 62.5, reps: 8, sets: 3 }, day2);
    expect(countCompletions(db, category)).toBe(2);
    expect(listWorkoutSets(db, category, '2026-09-20')).toHaveLength(2);
    expect(listWorkoutDates(db, category)).toEqual(['2026-09-21', '2026-09-20']);
  });

  it('removes the day completion when the last set of that day is deleted', () => {
    const { db, category } = setup();
    const first = addWorkoutSet(db, category, { exercise: 'ベンチプレス', weight_kg: 60, reps: 10, sets: 3 }, day1);
    const second = addWorkoutSet(db, category, { exercise: 'スクワット', weight_kg: 80, reps: 8, sets: 3 }, day1);
    deleteWorkoutSet(db, first.id);
    expect(countCompletions(db, category)).toBe(1);
    deleteWorkoutSet(db, second.id);
    expect(countCompletions(db, category)).toBe(0);
  });

  it('tracks personal bests per exercise', () => {
    const { db, category } = setup();
    addWorkoutSet(db, category, { exercise: 'ベンチプレス', weight_kg: 60, reps: 10, sets: 3 }, day1);
    addWorkoutSet(db, category, { exercise: 'ベンチプレス', weight_kg: 65, reps: 6, sets: 3 }, day2);
    addWorkoutSet(db, category, { exercise: 'スクワット', weight_kg: 80, reps: 8, sets: 3 }, day2);
    expect(getExerciseBest(db, category, 'ベンチプレス')).toMatchObject({ weight_kg: 65, reps: 6, date: '2026-09-21' });
    expect(getExerciseBest(db, category, '懸垂')).toBeNull();
    expect(listExerciseBests(db, category).map((best) => `${best.exercise}:${best.weight_kg}`)).toEqual(['スクワット:80', 'ベンチプレス:65']);
    expect(recentExercises(db, category)).toEqual(['スクワット', 'ベンチプレス']);
  });

  it('detects personal records by weight, then reps', () => {
    const best = { exercise: 'x', weight_kg: 60, reps: 8, date: '2026-09-20' };
    expect(isPersonalRecord(null, { exercise: 'x', weight_kg: 20, reps: 5, sets: 1 })).toBe(true);
    expect(isPersonalRecord(null, { exercise: 'x', weight_kg: 0, reps: 5, sets: 1 })).toBe(false);
    expect(isPersonalRecord(best, { exercise: 'x', weight_kg: 62.5, reps: 1, sets: 1 })).toBe(true);
    expect(isPersonalRecord(best, { exercise: 'x', weight_kg: 60, reps: 9, sets: 1 })).toBe(true);
    expect(isPersonalRecord(best, { exercise: 'x', weight_kg: 60, reps: 8, sets: 5 })).toBe(false);
  });

  it('ships a catalog with unique names covering every body part', () => {
    expect(new Set(exercises.map((exercise) => exercise.name)).size).toBe(exercises.length);
    expect(findExercise('懸垂')?.bodyweight).toBe(true);
    expect(findExercise('ベンチプレス')?.part).toBe('胸');
  });
});
