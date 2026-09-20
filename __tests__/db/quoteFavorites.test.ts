import { listFavoriteIds, toggleFavorite } from '../../src/db/quoteFavorites';
import { initDatabase } from '../../src/db/database';
import { createTestDb } from '../helpers/testDb';

describe('quote favorites', () => {
  it('toggles favorite state and lists saved quote ids', () => {
    const db = createTestDb();
    initDatabase(db);
    expect(listFavoriteIds(db)).toEqual([]);
    expect(toggleFavorite(db, 'kobe-01')).toBe(true);
    expect(listFavoriteIds(db)).toEqual(['kobe-01']);
    expect(toggleFavorite(db, 'kobe-01')).toBe(false);
    expect(listFavoriteIds(db)).toEqual([]);
  });
});
