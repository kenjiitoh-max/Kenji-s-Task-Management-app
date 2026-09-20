import { Db } from './Db';
import { localTimestamp } from './time';
import { BodyProfile, BodyRecord, Sex } from './types';

export function listBodyRecords(db: Db, limit = 30): BodyRecord[] {
  return db.getAllSync<BodyRecord>('SELECT * FROM body_records ORDER BY date DESC LIMIT ?', limit);
}

export function listBodyRecordsAsc(db: Db, sinceDate: string | null): BodyRecord[] {
  if (sinceDate) {
    return db.getAllSync<BodyRecord>(
      'SELECT * FROM body_records WHERE date >= ? ORDER BY date ASC',
      sinceDate,
    );
  }
  return db.getAllSync<BodyRecord>('SELECT * FROM body_records ORDER BY date ASC');
}

export function getLatestBodyRecord(db: Db): BodyRecord | null {
  return db.getFirstSync<BodyRecord>('SELECT * FROM body_records ORDER BY date DESC LIMIT 1');
}

export function upsertBodyRecord(db: Db, date: string, weightKg: number, bodyFatPct: number | null): number {
  const result = db.getFirstSync<{ id: number }>(
    `INSERT INTO body_records (date, weight_kg, body_fat_pct, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       weight_kg = excluded.weight_kg,
       body_fat_pct = excluded.body_fat_pct
     RETURNING id`,
    date,
    weightKg,
    bodyFatPct,
    localTimestamp(),
  );
  return result?.id ?? 0;
}

export function deleteBodyRecord(db: Db, id: number): void {
  db.runSync('DELETE FROM body_records WHERE id = ?', id);
}

export function getBodyProfile(db: Db): BodyProfile {
  const rows = db.getAllSync<{ key: string; value: string }>(
    "SELECT key, value FROM settings WHERE key IN ('height_cm', 'sex')",
  );
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const height = Number(map.height_cm);
  return {
    height_cm: Number.isFinite(height) && height > 0 ? height : null,
    sex: map.sex === 'female' ? 'female' : 'male',
  };
}

export function saveBodyProfile(db: Db, profile: { height_cm: number; sex: Sex }): void {
  const upsert = 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value';
  db.runSync(upsert, 'height_cm', String(profile.height_cm));
  db.runSync(upsert, 'sex', profile.sex);
}
