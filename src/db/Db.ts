export interface Db {
  execSync(source: string): void;
  runSync(source: string, ...params: unknown[]): { changes: number; lastInsertRowId: number };
  getFirstSync<T>(source: string, ...params: unknown[]): T | null;
  getAllSync<T>(source: string, ...params: unknown[]): T[];
}
