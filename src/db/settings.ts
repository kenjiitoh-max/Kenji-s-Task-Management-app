import { isThemeName, type ThemeName } from '../theme';
import type { Db } from './Db';

export function getThemePreference(db: Db): ThemeName {
  const value = db.getFirstSync<{ value: string }>("SELECT value FROM settings WHERE key = 'theme'")?.value;
  return isThemeName(value) ? value : 'dark';
}

export function setThemePreference(db: Db, theme: ThemeName): void {
  db.runSync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    'theme',
    theme,
  );
}
