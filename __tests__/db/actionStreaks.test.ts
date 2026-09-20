import { createCategory } from '../../src/db/categories';
import { createDailyAction, listActionStreaks } from '../../src/db/dailyActions';
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

  it('uses localTimestamp-compatible dates', () => {
    expect(localTimestamp().slice(0, 10)).toBe(localDate());
  });
});
