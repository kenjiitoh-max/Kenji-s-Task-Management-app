import { moveItem, targetIndex } from '../../src/components/dragMath';
import { createCategory, listCategories, reorderCategories } from '../../src/db/categories';
import { initDatabase } from '../../src/db/database';
import { createTestDb } from '../helpers/testDb';

describe('drag reorder', () => {
  it('moves an item to a new index', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('picks the target index once the drag passes half of the neighbour', () => {
    const heights = [100, 100, 200, 100];
    expect(targetIndex(heights, 0, 40)).toBe(0);
    expect(targetIndex(heights, 0, 60)).toBe(1);
    expect(targetIndex(heights, 0, 190)).toBe(1);
    expect(targetIndex(heights, 0, 210)).toBe(2);
    expect(targetIndex(heights, 3, -260)).toBe(1);
    expect(targetIndex(heights, 3, -1000)).toBe(0);
  });

  it('persists the order and keeps new categories at the end', () => {
    const db = createTestDb();
    initDatabase(db);
    const a = createCategory(db, 'A', '#000');
    const b = createCategory(db, 'B', '#000');
    const c = createCategory(db, 'C', '#000');
    reorderCategories(db, [c, a, b]);
    expect(listCategories(db).map((item) => item.id)).toEqual([c, a, b]);
    const d = createCategory(db, 'D', '#000');
    expect(listCategories(db).map((item) => item.id)).toEqual([c, a, b, d]);
  });
});
