import { earnedMilestones, hasStamp, longestStreak, milestoneFor, nextMilestone, stampDays, stampTier, streakEndingAt } from '../../src/growth/stamps';

describe('stamps', () => {
  const today = '2026-10-05';
  const dates = ['2026-10-03T08:00:00', '2026-10-05T21:30:00', '2026-10-05T09:00:00'];

  it('stampDays returns last N days ending today, oldest first', () => {
    const days = stampDays(dates, 3, today);
    expect(days).toHaveLength(3);
    expect(days.map((day) => day.date)).toEqual(['2026-10-03', '2026-10-04', '2026-10-05']);
    expect(days.map((day) => day.stamped)).toEqual([true, false, true]);
    expect(days[2].isToday).toBe(true);
    expect(days[0].isToday).toBe(false);
  });

  it('hasStamp matches any timestamp on the date', () => {
    expect(hasStamp(dates, '2026-10-05')).toBe(true);
    expect(hasStamp(dates, '2026-10-04')).toBe(false);
  });

  it('milestoneFor matches exact streaks only', () => {
    expect(milestoneFor(3)?.emoji).toBe('🔥');
    expect(milestoneFor(4)).toBeNull();
  });

  it('nextMilestone returns the first milestone above the streak', () => {
    expect(nextMilestone(3)?.days).toBe(5);
    expect(nextMilestone(100)).toBeNull();
  });

  it('longestStreak counts the longest run across history', () => {
    const gapped = [
      '2026-10-01T10:00:00',
      '2026-10-02T10:00:00',
      '2026-10-03T10:00:00',
      '2026-10-05T10:00:00',
      '2026-10-06T10:00:00',
    ];
    expect(longestStreak(gapped)).toBe(3);
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(['2026-10-01T10:00:00', '2026-10-01T12:00:00'])).toBe(1);
  });

  it('earnedMilestones returns all milestones up to the longest streak', () => {
    const streak = ['2026-10-01T10:00:00', '2026-10-02T10:00:00', '2026-10-03T10:00:00'];
    expect(earnedMilestones(streak).map((m) => m.days)).toEqual([1, 3]);
    expect(earnedMilestones([])).toEqual([]);
  });

  it('streakEndingAt counts the run ending on that day', () => {
    const history = ['2026-10-01T10:00:00', '2026-10-02T10:00:00', '2026-10-04T10:00:00', '2026-10-05T10:00:00', '2026-10-06T10:00:00'];
    expect(streakEndingAt(history, '2026-10-02')).toBe(2);
    expect(streakEndingAt(history, '2026-10-06')).toBe(3);
    expect(streakEndingAt(history, '2026-10-03')).toBe(0);
  });

  it('stampTier maps streaks to tiers', () => {
    expect(stampTier(0)).toBe('bronze');
    expect(stampTier(2)).toBe('bronze');
    expect(stampTier(3)).toBe('silver');
    expect(stampTier(6)).toBe('silver');
    expect(stampTier(7)).toBe('gold');
    expect(stampTier(29)).toBe('gold');
    expect(stampTier(30)).toBe('diamond');
  });
});
