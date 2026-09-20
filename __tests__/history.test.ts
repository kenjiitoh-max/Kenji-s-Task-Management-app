import { currentStreak, dailyCompletionCounts, xpTrajectory } from '../src/growth/history';

describe('history calculations', () => {
  it('fills daily completion counts in date order', () => {
    expect(dailyCompletionCounts(['2026-01-02T09:00:00', '2026-01-04T09:00:00', '2026-01-04T10:00:00'], 3, '2026-01-04')).toEqual([
      { x: '2026-01-02', y: 1 },
      { x: '2026-01-03', y: 0 },
      { x: '2026-01-04', y: 2 },
    ]);
  });

  it('marks the level reached on the date it is reached', () => {
    const result = xpTrajectory([
      '2026-01-01T09:00:00',
      '2026-01-02T09:00:00',
      '2026-01-03T09:00:00',
    ]);
    expect(result.levelUps).toEqual([{ x: '2026-01-03', level: 2 }]);
  });

  it('emits one marker for multiple levels reached on one day', () => {
    const result = xpTrajectory([
      '2026-01-01T09:00:00',
      '2026-01-01T10:00:00',
      '2026-01-01T11:00:00',
      '2026-01-01T12:00:00',
      '2026-01-01T13:00:00',
      '2026-01-01T14:00:00',
      '2026-01-01T15:00:00',
      '2026-01-01T16:00:00',
    ]);
    expect(result.levelUps).toEqual([{ x: '2026-01-01', level: 3 }]);
  });

  it('returns empty trajectories for empty input', () => {
    expect(xpTrajectory([])).toEqual({ points: [], levelUps: [] });
  });

  it('counts a streak ending today or yesterday', () => {
    expect(currentStreak(['2026-01-01T09:00:00', '2026-01-02T09:00:00'], '2026-01-02')).toBe(2);
    expect(currentStreak(['2026-01-01T09:00:00', '2026-01-02T09:00:00'], '2026-01-03')).toBe(2);
    expect(currentStreak(['2026-01-01T09:00:00'], '2026-01-03')).toBe(0);
  });
});
