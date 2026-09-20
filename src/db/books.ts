import { Db } from './Db';
import { localTimestamp } from './time';
import { Book, BookStatus } from './types';

export const bookStatuses: BookStatus[] = ['want', 'reading', 'done'];

export const bookStatusLabels: Record<BookStatus, string> = {
  want: '読みたい',
  reading: '読んでる',
  done: '読了',
};

export interface NewBook {
  title: string;
  authors: string | null;
  cover_url: string | null;
  external_id: string | null;
}

export function listBooks(db: Db, categoryId: number): Book[] {
  return db.getAllSync<Book>(
    'SELECT * FROM books WHERE category_id = ? ORDER BY CASE status WHEN ? THEN 0 WHEN ? THEN 1 ELSE 2 END, updated_at DESC, id DESC',
    categoryId,
    'reading',
    'want',
  );
}

export function addBook(db: Db, categoryId: number, book: NewBook, status: BookStatus = 'want'): number {
  const now = localTimestamp();
  let id = 0;
  db.withTransactionSync(() => {
    id = db.runSync(
      'INSERT INTO books (category_id, title, authors, cover_url, external_id, status, finished_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      categoryId,
      book.title.trim(),
      book.authors,
      book.cover_url,
      book.external_id,
      status,
      status === 'done' ? now : null,
      now,
      now,
    ).lastInsertRowId;
    if (status === 'done') logFinish(db, categoryId, id, now);
  });
  return id;
}

export function setBookStatus(db: Db, id: number, status: BookStatus): void {
  const current = db.getFirstSync<{ status: BookStatus; category_id: number }>('SELECT status, category_id FROM books WHERE id = ?', id);
  if (!current || current.status === status) return;
  const now = localTimestamp();
  db.withTransactionSync(() => {
    db.runSync('UPDATE books SET status = ?, finished_at = ?, updated_at = ? WHERE id = ?', status, status === 'done' ? now : null, now, id);
    if (status === 'done') logFinish(db, current.category_id, id, now);
    else if (current.status === 'done') db.runSync('DELETE FROM completion_log WHERE book_id = ?', id);
  });
}

export function deleteBook(db: Db, id: number): void {
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM completion_log WHERE book_id = ?', id);
    db.runSync('DELETE FROM books WHERE id = ?', id);
  });
}

export function countBooksByStatus(db: Db, categoryId: number): Record<BookStatus, number> {
  const rows = db.getAllSync<{ status: BookStatus; count: number }>('SELECT status, COUNT(*) AS count FROM books WHERE category_id = ? GROUP BY status', categoryId);
  const counts: Record<BookStatus, number> = { want: 0, reading: 0, done: 0 };
  for (const row of rows) counts[row.status] = row.count;
  return counts;
}

function logFinish(db: Db, categoryId: number, bookId: number, at: string): void {
  db.runSync('INSERT INTO completion_log (category_id, book_id, completed_at) VALUES (?, ?, ?)', categoryId, bookId, at);
}
