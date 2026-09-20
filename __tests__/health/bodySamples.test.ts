import { localDateOf, mergeBodySamples, normalizeFatPct } from '../../src/health/bodySamples';

describe('body samples', () => {
  it('localDateOf formats YYYY-MM-DD in local time', () => {
    expect(localDateOf(new Date(2026, 9, 5, 8, 30))).toBe('2026-10-05');
    expect(localDateOf('2026-10-05T08:30:00')).toBe('2026-10-05');
  });

  it('normalizeFatPct handles fractions and percents', () => {
    expect(normalizeFatPct(0.173)).toBe(17.3);
    expect(normalizeFatPct(17.3)).toBe(17.3);
    expect(normalizeFatPct(1)).toBe(100);
  });

  it('mergeBodySamples takes the latest sample per day and sorts by date', () => {
    const records = mergeBodySamples(
      [
        { quantity: 70.4, endDate: '2026-10-02T07:00:00' },
        { quantity: 70.9, endDate: '2026-10-02T21:00:00' },
        { quantity: 71.24, endDate: '2026-10-01T08:00:00' },
      ],
      [{ quantity: 0.182, endDate: '2026-10-02T07:30:00' }],
    );
    expect(records).toEqual([
      { date: '2026-10-01', weightKg: 71.2, bodyFatPct: null },
      { date: '2026-10-02', weightKg: 70.9, bodyFatPct: 18.2 },
    ]);
  });

  it('drops days that have only fat samples', () => {
    const records = mergeBodySamples(
      [{ quantity: 70, endDate: '2026-10-01T08:00:00' }],
      [{ quantity: 18, endDate: '2026-10-02T08:00:00' }],
    );
    expect(records).toEqual([{ date: '2026-10-01', weightKg: 70, bodyFatPct: null }]);
  });
});
