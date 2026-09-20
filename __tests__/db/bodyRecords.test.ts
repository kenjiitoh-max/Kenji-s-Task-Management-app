import { createTestDb } from '../helpers/testDb';
import { getBodyProfile, getLatestBodyRecord, listBodyRecords, saveBodyProfile, upsertBodyRecord } from '../../src/db/bodyRecords';
import { initDatabase } from '../../src/db/database';

describe('body records', () => {
  it('upserts one record per date', () => {
    const db = createTestDb();
    initDatabase(db);
    upsertBodyRecord(db, '2026-09-19', 80, null);
    upsertBodyRecord(db, '2026-09-19', 79.5, 22);
    expect(listBodyRecords(db)).toHaveLength(1);
    expect(getLatestBodyRecord(db)?.weight_kg).toBe(79.5);
  });

  it('reads and saves the body profile', () => {
    const db = createTestDb();
    initDatabase(db);
    expect(getBodyProfile(db)).toEqual({ height_cm: null, sex: 'male' });
    saveBodyProfile(db, { height_cm: 170, sex: 'female' });
    expect(getBodyProfile(db)).toEqual({ height_cm: 170, sex: 'female' });
  });
});
