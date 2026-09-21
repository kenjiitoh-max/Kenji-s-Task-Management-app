import { createCategory } from '../../src/db/categories';
import { categoryStreak, createDailyAction, listActionStreaks } from '../../src/db/dailyActions';
import { initDatabase } from '../../src/db/database';
import { localDate, localTimestamp } from '../../src/db/time';
import { createTestDb } from '../helpers/testDb';
import { shiftDate } from '../../src/growth/history';

const yesterday = () => shiftDate(localDate(), -1);

describe('action streaks', () => {
  it('computes a streak per action and sorts by streak desc', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '英語', '#000000');
    const a = createDailyAction(db, category, '英単語10個');
    const b = createDailyAction(db, category, 'リスニング');
    const c = createDailyAction(db, category, '音読');
    db.runSync('INSERT INTO completion_log (category_id, action_id, completed_at) VALUES (?, ?, ?)', category, a, `${localDate()}T08:00:00`);
    db.runSync('INSERT INTO completion_log (category_id, action_id, completed_at) VALUES (?, ?, ?)', category, a, `${yesterday()}T08:00:00`);
    db.runSync('INSERT INTO completion_log (category_id, action_id, completed_at) VALUES (?, ?, ?)', category, b, `${localDate()}T09:00:00`);
    const streaks = listActionStreaks(db, category);
    expect(streaks.map((s) => [s.id, s.streak])).toEqual([[a, 2], [b, 1], [c, 0]]);
  });

  it('counts a category streak when any action was completed each day', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, 'English', '#000000');
    const a = createDailyAction(db, category, 'A');
    const b = createDailyAction(db, category, 'B');
    const log = (action: number, offset: number) => db.runSync('INSERT INTO completion_log (category_id, action_id, completed_at) VALUES (?, ?, ?)', category, action, `${shiftDate(localDate(), offset)}T08:00:00`);
    log(a, 0);
    log(b, 0);
    log(b, -1);
    log(a, -2);
    log(a, -4);
    expect(categoryStreak(db, category, 'bird')).toBe(3);
    expect(categoryStreak(db, createCategory(db, 'Empty', '#000000'), 'reader')).toBe(0);
  });

  it('counts body records and workout sets toward weight/athlete streaks', () => {
    const db = createTestDb();
    initDatabase(db);
    const weight = createCategory(db, '体重管理', '#000000');
    const workout = createCategory(db, 'Workout', '#000000');
    db.runSync('INSERT INTO body_records (date, weight_kg, created_at) VALUES (?, ?, ?)', localDate(), 70, localTimestamp());
    db.runSync('INSERT INTO body_records (date, weight_kg, created_at) VALUES (?, ?, ?)', yesterday(), 70, localTimestamp());
    db.runSync('INSERT INTO workout_sets (category_id, exercise, weight_kg, reps, sets, date, performed_at) VALUES (?, ?, ?, ?, ?, ?, ?)', workout, 'Squat', 60, 5, 3, localDate(), localTimestamp());
    expect(categoryStreak(db, weight, 'weight')).toBe(2);
    expect(categoryStreak(db, workout, 'athlete')).toBe(1);
    expect(categoryStreak(db, workout, null)).toBe(0);
  });

  it('uses localTimestamp-compatible dates', () => {
    expect(localTimestamp().slice(0, 10)).toBe(localDate());
  });
});
