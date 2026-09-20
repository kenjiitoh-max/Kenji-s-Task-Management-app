import { addBook, countBooksByStatus, deleteBook, listBooks, setBookStatus } from '../../src/db/books';
import { createCategory } from '../../src/db/categories';
import { countCompletions } from '../../src/db/dailyActions';
import { initDatabase } from '../../src/db/database';
import { createTestDb } from '../helpers/testDb';

const sample = { title: '  Mamba Mentality ', authors: 'Kobe Bryant', cover_url: 'https://example.com/c.jpg', external_id: 'abc' };

describe('books', () => {
  it('adds books and orders reading > want > done', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '読書', '#000000');
    addBook(db, category, { ...sample, title: 'A' }, 'done');
    addBook(db, category, { ...sample, title: 'B' }, 'want');
    addBook(db, category, { ...sample, title: 'C' }, 'reading');
    expect(listBooks(db, category).map((book) => book.title)).toEqual(['C', 'B', 'A']);
    expect(countBooksByStatus(db, category)).toEqual({ want: 1, reading: 1, done: 1 });
  });

  it('trims titles and logs a completion when a book is finished', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '読書', '#000000');
    const id = addBook(db, category, sample);
    expect(listBooks(db, category)[0].title).toBe('Mamba Mentality');
    expect(countCompletions(db, category)).toBe(0);
    setBookStatus(db, id, 'done');
    expect(countCompletions(db, category)).toBe(1);
    expect(listBooks(db, category)[0].finished_at).not.toBeNull();
    setBookStatus(db, id, 'done');
    expect(countCompletions(db, category)).toBe(1);
    setBookStatus(db, id, 'reading');
    expect(countCompletions(db, category)).toBe(0);
    expect(listBooks(db, category)[0].finished_at).toBeNull();
  });

  it('removes the completion when a finished book is deleted', () => {
    const db = createTestDb();
    initDatabase(db);
    const category = createCategory(db, '読書', '#000000');
    const id = addBook(db, category, sample, 'done');
    expect(countCompletions(db, category)).toBe(1);
    deleteBook(db, id);
    expect(countCompletions(db, category)).toBe(0);
    expect(listBooks(db, category)).toHaveLength(0);
  });

  it('adds the book_id column to an existing completion_log table', () => {
    const db = createTestDb();
    db.execSync('CREATE TABLE completion_log (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, action_id INTEGER, completed_at TEXT NOT NULL)');
    initDatabase(db);
    initDatabase(db);
    expect(db.getAllSync<{ name: string }>('PRAGMA table_info(completion_log)').map((column) => column.name)).toContain('book_id');
  });
});
