import { createTestDb } from '../helpers/testDb';
import { Db } from '../../src/db/Db';
import { initDatabase } from '../../src/db/database';
import { getThemePreference, setThemePreference } from '../../src/db/settings';

function setupDb(): Db {
  const db = createTestDb();
  initDatabase(db);
  return db;
}

describe('theme settings', () => {
  it('defaults to dark when no preference is stored', () => {
    expect(getThemePreference(setupDb())).toBe('dark');
  });

  it.each(['light', 'dark', 'system'] as const)('persists the %s preference', (theme) => {
    const db = setupDb();
    setThemePreference(db, theme);
    expect(getThemePreference(db)).toBe(theme);
  });

  it('defaults to dark when the stored preference is invalid', () => {
    const db = setupDb();
    db.runSync("INSERT INTO settings (key, value) VALUES ('theme', 'automatic')");
    expect(getThemePreference(db)).toBe('dark');
  });

  it('overwrites a previously stored preference', () => {
    const db = setupDb();
    setThemePreference(db, 'light');
    setThemePreference(db, 'system');
    expect(getThemePreference(db)).toBe('system');
  });
});
