import { applyActionTemplate, createActionTemplate, deleteActionTemplate, listActionTemplates, templateExists } from '../../src/db/actionTemplates';
import { createCategory, deleteCategory } from '../../src/db/categories';
import { listDailyActions } from '../../src/db/dailyActions';
import { initDatabase } from '../../src/db/database';
import { createTestDb } from '../helpers/testDb';

describe('action templates', () => {
  it('creates and lists templates in sort order', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '英語', '#000000');
    createActionTemplate(db, category, 'B');
    createActionTemplate(db, category, 'A');
    expect(listActionTemplates(db, category).map((template) => template.title)).toEqual(['B', 'A']);
  });

  it('returns the existing id for a duplicate title', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '英語', '#000000');
    const first = createActionTemplate(db, category, '  英単語10個  ');
    const second = createActionTemplate(db, category, '英単語10個');
    expect(second).toBe(first);
    expect(listActionTemplates(db, category)).toHaveLength(1);
    expect(templateExists(db, category, '英単語10個')).toBe(true);
    expect(templateExists(db, category, 'リスニング')).toBe(false);
  });

  it('apply creates a daily action once', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '英語', '#000000');
    const template = createActionTemplate(db, category, '英単語10個');
    const actionId = applyActionTemplate(db, template);
    expect(actionId).not.toBeNull();
    expect(listDailyActions(db, category).map((action) => action.title)).toEqual(['英単語10個']);
    expect(applyActionTemplate(db, template)).toBeNull();
    expect(listDailyActions(db, category)).toHaveLength(1);
  });

  it('deletes templates', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '英語', '#000000');
    const template = createActionTemplate(db, category, '英単語10個');
    deleteActionTemplate(db, template);
    expect(listActionTemplates(db, category)).toHaveLength(0);
  });

  it('cascades on category delete', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '英語', '#000000');
    createActionTemplate(db, category, '英単語10個');
    deleteCategory(db, category);
    expect(db.getAllSync('SELECT * FROM action_templates')).toHaveLength(0);
  });
});
