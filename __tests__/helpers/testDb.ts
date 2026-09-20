import BetterSqlite3 from 'better-sqlite3';
import { Db } from '../../src/db/Db';

export function createTestDb(): Db {
  const sqlite = new BetterSqlite3(':memory:');
  return {
    execSync: (source) => sqlite.exec(source),
    runSync: (source, ...params) => {
      const result = sqlite.prepare(source).run(...params);
      return { changes: Number(result.changes), lastInsertRowId: Number(result.lastInsertRowid) };
    },
    getFirstSync: <T>(source: string, ...params: unknown[]) => (sqlite.prepare(source).get(...params) as T | undefined) ?? null,
    getAllSync: <T>(source: string, ...params: unknown[]) => sqlite.prepare(source).all(...params) as T[],
  };
}
