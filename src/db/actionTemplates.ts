import { Db } from './Db';
import { createDailyAction } from './dailyActions';
import { localTimestamp } from './time';
import { ActionTemplate } from './types';

export function listActionTemplates(db: Db, categoryId: number): ActionTemplate[] {
  return db.getAllSync<ActionTemplate>(
    'SELECT * FROM action_templates WHERE category_id = ? ORDER BY sort_order, id',
    categoryId,
  );
}

export function createActionTemplate(db: Db, categoryId: number, title: string): number {
  const trimmed = title.trim();
  const next = db.getFirstSync<{ max_order: number | null }>(
    'SELECT MAX(sort_order) AS max_order FROM action_templates WHERE category_id = ?',
    categoryId,
  );
  db.runSync(
    'INSERT INTO action_templates (category_id, title, sort_order, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(category_id, title) DO NOTHING',
    categoryId,
    trimmed,
    (next?.max_order ?? 0) + 1,
    localTimestamp(),
  );
  const row = db.getFirstSync<{ id: number }>(
    'SELECT id FROM action_templates WHERE category_id = ? AND title = ?',
    categoryId,
    trimmed,
  );
  return row!.id;
}

export function deleteActionTemplate(db: Db, id: number): void {
  db.runSync('DELETE FROM action_templates WHERE id = ?', id);
}

export function applyActionTemplate(db: Db, templateId: number): number | null {
  const template = db.getFirstSync<ActionTemplate>('SELECT * FROM action_templates WHERE id = ?', templateId);
  if (!template) return null;
  const existing = db.getFirstSync<{ id: number }>(
    'SELECT id FROM daily_actions WHERE category_id = ? AND title = ?',
    template.category_id,
    template.title,
  );
  if (existing) return null;
  return createDailyAction(db, template.category_id, template.title);
}

export function templateExists(db: Db, categoryId: number, title: string): boolean {
  return Boolean(db.getFirstSync<{ id: number }>(
    'SELECT id FROM action_templates WHERE category_id = ? AND title = ?',
    categoryId,
    title.trim(),
  ));
}
