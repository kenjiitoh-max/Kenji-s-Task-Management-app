import { Db } from './Db';
import { Category } from './types';

const today = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

export function listCategories(db: Db): Category[] {
  return db.getAllSync<Category>('SELECT * FROM categories ORDER BY id');
}

export function getCategory(db: Db, id: number): Category | null {
  return db.getFirstSync<Category>('SELECT * FROM categories WHERE id = ?', id);
}

export function createCategory(db: Db, name: string, color: string): number {
  return db.runSync(
    'INSERT INTO categories (name, color, created_at) VALUES (?, ?, ?)',
    name.trim(),
    color,
    new Date().toISOString(),
  ).lastInsertRowId;
}

export function updateCategory(db: Db, id: number, name: string, color: string): void {
  db.runSync('UPDATE categories SET name = ?, color = ? WHERE id = ?', name.trim(), color, id);
}

export function deleteCategory(db: Db, id: number): void {
  db.runSync('DELETE FROM categories WHERE id = ?', id);
}

export function getCategoryProgress(db: Db, categoryId: number): { total: number; completed: number } {
  const date = `${today()}%`;
  const result = db.getFirstSync<{ total: number; completed: number }>(
    `SELECT COUNT(*) AS total,
      SUM(CASE WHEN is_completed = 1 AND completed_at LIKE ? THEN 1 ELSE 0 END) AS completed
     FROM daily_actions WHERE category_id = ?`,
    date,
    categoryId,
  );
  return { total: result?.total ?? 0, completed: result?.completed ?? 0 };
}
