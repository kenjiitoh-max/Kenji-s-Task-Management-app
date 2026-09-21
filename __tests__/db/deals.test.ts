import { initDatabase } from '../../src/db/database';
import { addDeal, deleteDeal, listDeals } from '../../src/db/deals';
import { createTestDb } from '../helpers/testDb';

describe('deals', () => {
  it('stores deals newest-first and deletes them', () => {
    const db = createTestDb();
    initDatabase(db);
    const first = addDeal(db, { kind: 'new', amount_usd: 12_000, closed_on: '2026-09-01', fx_rate: 150.5, fx_date: '2026-09-01', memo: '  ' });
    const second = addDeal(db, { kind: 'renewal', amount_usd: 8_000, closed_on: '2026-09-15', fx_rate: 157.89, fx_date: '2026-09-14', memo: '更新' });
    const deals = listDeals(db);
    expect(deals.map((deal) => deal.id)).toEqual([second, first]);
    expect(deals[1]).toMatchObject({ kind: 'new', amount_usd: 12_000, fx_rate: 150.5, memo: null });
    expect(deals[0].memo).toBe('更新');
    deleteDeal(db, first);
    expect(listDeals(db)).toHaveLength(1);
  });

  it('rejects unknown kinds', () => {
    const db = createTestDb();
    initDatabase(db);
    expect(() => db.runSync("INSERT INTO deals (kind, amount_usd, closed_on, fx_rate, fx_date, created_at) VALUES ('other', 1, '2026-01-01', 1, '2026-01-01', 'x')")).toThrow();
  });
});
