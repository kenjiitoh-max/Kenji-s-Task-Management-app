import { createTestDb } from '../helpers/testDb';
import { getBodyProfile, getLatestBodyRecord, importBodyRecords, isHealthSyncEnabled, listBodyRecords, saveBodyProfile, setHealthSyncEnabled, upsertBodyRecord } from '../../src/db/bodyRecords';
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

  it('imports records and keeps existing fat when incoming is null', () => {
    const db = createTestDb();
    initDatabase(db);
    upsertBodyRecord(db, '2026-10-01', 80, 20);
    const count = importBodyRecords(db, [
      { date: '2026-10-01', weightKg: 79.2, bodyFatPct: null },
      { date: '2026-10-02', weightKg: 78.8, bodyFatPct: 19.4 },
    ]);
    expect(count).toBe(2);
    const records = listBodyRecords(db);
    expect(records).toHaveLength(2);
    const first = records.find((record) => record.date === '2026-10-01');
    expect(first?.weight_kg).toBe(79.2);
    expect(first?.body_fat_pct).toBe(20);
    expect(records.find((record) => record.date === '2026-10-02')?.body_fat_pct).toBe(19.4);
  });

  it('round trips the health sync flag', () => {
    const db = createTestDb();
    initDatabase(db);
    expect(isHealthSyncEnabled(db)).toBe(false);
    setHealthSyncEnabled(db, true);
    expect(isHealthSyncEnabled(db)).toBe(true);
    setHealthSyncEnabled(db, false);
    expect(isHealthSyncEnabled(db)).toBe(false);
  });
});
