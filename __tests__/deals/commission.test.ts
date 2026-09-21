import { commissionJpy, cumulativeByDay, fiscalYearOf, lootFor, nextPayout, quarterOf, quarterPayouts, rankFor, summarizeFiscalYear } from '../../src/deals/commission';
import { fetchUsdJpy } from '../../src/deals/fx';
import { Deal } from '../../src/db/types';

const deal = (id: number, kind: Deal['kind'], amount_usd: number, closed_on: string, fx_rate = 150): Deal => ({ id, kind, amount_usd, closed_on, fx_rate, fx_date: closed_on, memo: null, created_at: closed_on });

describe('fiscal calendar (Feb start)', () => {
  it('maps months to fiscal year and quarter', () => {
    expect(fiscalYearOf('2026-02-01')).toBe(2026);
    expect(fiscalYearOf('2026-01-31')).toBe(2025);
    expect(quarterOf('2026-02-15').quarter).toBe(1);
    expect(quarterOf('2026-04-30').quarter).toBe(1);
    expect(quarterOf('2026-05-01').quarter).toBe(2);
    expect(quarterOf('2026-09-20').quarter).toBe(3);
    expect(quarterOf('2026-11-01').quarter).toBe(4);
    expect(quarterOf('2027-01-15')).toMatchObject({ fiscalYear: 2026, quarter: 4, start: '2026-11-01', end: '2027-01-31' });
  });

  it('pays on the 28th of the month after quarter end', () => {
    expect(quarterOf('2026-03-01').payoutDate).toBe('2026-05-28');
    expect(quarterOf('2026-09-20').payoutDate).toBe('2026-11-28');
    expect(quarterOf('2026-12-01').payoutDate).toBe('2027-02-28');
  });
});

describe('commission', () => {
  it('applies 8% for new and 4% for renewal in JPY at the closing rate', () => {
    expect(commissionJpy({ kind: 'new', amount_usd: 10_000, fx_rate: 150 })).toBe(120_000);
    expect(commissionJpy({ kind: 'renewal', amount_usd: 10_000, fx_rate: 150 })).toBe(60_000);
    expect(commissionJpy({ kind: 'new', amount_usd: 1234.56, fx_rate: 157.89 })).toBe(Math.round(1234.56 * 157.89 * 0.08));
  });

  it('summarizes the fiscal year and cumulative curve', () => {
    const deals = [deal(1, 'new', 20_000, '2026-03-10'), deal(2, 'renewal', 5_000, '2026-03-10'), deal(3, 'new', 30_000, '2026-08-01'), deal(4, 'new', 99_999, '2026-01-20')];
    expect(summarizeFiscalYear(deals, 2026)).toMatchObject({ newUsd: 50_000, renewalUsd: 5_000, totalUsd: 55_000, dealCount: 3, commissionJpy: (20_000 * 0.08 + 5_000 * 0.04 + 30_000 * 0.08) * 150 });
    expect(cumulativeByDay(deals, 2026)).toEqual([{ date: '2026-03-10', totalUsd: 25_000 }, { date: '2026-08-01', totalUsd: 55_000 }]);
  });

  it('groups payouts by quarter and finds the next unpaid one', () => {
    const deals = [deal(1, 'new', 10_000, '2026-03-10'), deal(2, 'renewal', 10_000, '2026-09-01')];
    const payouts = quarterPayouts(deals, 2026, '2026-09-20');
    expect(payouts.map((p) => p.commissionJpy)).toEqual([120_000, 0, 60_000, 0]);
    expect(payouts.map((p) => p.paid)).toEqual([true, true, false, false]);
    expect(nextPayout(deals, '2026-09-20')).toMatchObject({ label: 'FY2026 Q3', payoutDate: '2026-11-28', commissionJpy: 60_000 });
    expect(nextPayout(deals, '2026-05-01')).toMatchObject({ label: 'FY2026 Q1', payoutDate: '2026-05-28', commissionJpy: 120_000 });
    expect(nextPayout(deals, '2026-02-10')).toMatchObject({ label: 'FY2025 Q4', payoutDate: '2026-02-28' });
  });

  it('ranks and loot scale with amount', () => {
    expect(rankFor(0).current.title).toBe('ルーキー');
    expect(rankFor(160_000)).toMatchObject({ current: { title: 'クローザー' }, next: { title: 'エース' } });
    expect(rankFor(2_000_000).next).toBeNull();
    expect(lootFor(1_000)).toBe('🪙');
    expect(lootFor(250_000)).toBe('👑');
  });
});

describe('fx', () => {
  it('reads the JPY rate and the actual rate date', async () => {
    const fetcher = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ date: '2026-09-18', rates: { JPY: 157.89 } }) })) as unknown as typeof fetch;
    expect(await fetchUsdJpy('2026-09-20', fetcher)).toEqual({ rate: 157.89, rateDate: '2026-09-18' });
    expect((fetcher as jest.Mock).mock.calls[0][0]).toContain('/v1/2026-09-20?base=USD&symbols=JPY');
  });

  it('throws when the rate is missing', async () => {
    const fetcher = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({}) })) as unknown as typeof fetch;
    await expect(fetchUsdJpy('2026-09-20', fetcher)).rejects.toThrow('見つかりません');
  });
});
