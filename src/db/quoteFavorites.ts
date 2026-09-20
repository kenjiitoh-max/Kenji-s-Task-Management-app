import { Db } from './Db';
import { localTimestamp } from './time';

export function listFavoriteIds(db: Db): string[] {
  return db.getAllSync<{ quote_id: string }>('SELECT quote_id FROM quote_favorites ORDER BY created_at DESC').map((row) => row.quote_id);
}

export function toggleFavorite(db: Db, quoteId: string): boolean {
  const existing = db.getFirstSync<{ quote_id: string }>('SELECT quote_id FROM quote_favorites WHERE quote_id = ?', quoteId);
  if (existing) {
    db.runSync('DELETE FROM quote_favorites WHERE quote_id = ?', quoteId);
    return false;
  }
  db.runSync('INSERT INTO quote_favorites (quote_id, created_at) VALUES (?, ?)', quoteId, localTimestamp());
  return true;
}
