import { shiftDate } from './history';

export type StampDay = { date: string; stamped: boolean; isToday: boolean };
export type Milestone = { days: number; title: string; emoji: string };

export const MILESTONES: Milestone[] = [
  { days: 1, title: '最初の一歩', emoji: '🌱' },
  { days: 3, title: '三日坊主を突破', emoji: '🔥' },
  { days: 5, title: '5日連続', emoji: '⭐' },
  { days: 7, title: '1週間達成', emoji: '🏅' },
  { days: 14, title: '2週間達成', emoji: '🥈' },
  { days: 30, title: '1ヶ月達成', emoji: '🥇' },
  { days: 60, title: '2ヶ月達成', emoji: '💎' },
  { days: 100, title: '100日達成', emoji: '👑' },
];

export function hasStamp(dates: string[], date: string): boolean {
  return dates.some((timestamp) => timestamp.slice(0, 10) === date);
}

export function stampDays(dates: string[], days: number, today: string): StampDay[] {
  return Array.from({ length: Math.max(0, days) }, (_, index) => {
    const date = shiftDate(today, index - days + 1);
    return { date, stamped: hasStamp(dates, date), isToday: date === today };
  });
}

export function milestoneFor(streak: number): Milestone | null {
  return MILESTONES.find((milestone) => milestone.days === streak) ?? null;
}

export function nextMilestone(streak: number): Milestone | null {
  return MILESTONES.find((milestone) => milestone.days > streak) ?? null;
}

export type StampTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export function stampTier(streak: number): StampTier {
  if (streak < 3) return 'bronze';
  if (streak < 7) return 'silver';
  if (streak < 30) return 'gold';
  return 'diamond';
}

export function streakEndingAt(dates: string[], date: string): number {
  if (!hasStamp(dates, date)) return 0;
  const days = new Set(dates.map((timestamp) => timestamp.slice(0, 10)));
  let streak = 0;
  let day = date;
  while (days.has(day)) {
    streak += 1;
    day = shiftDate(day, -1);
  }
  return streak;
}

export function longestStreak(dates: string[]): number {
  const days = [...new Set(dates.map((timestamp) => timestamp.slice(0, 10)))].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    run = previous !== null && shiftDate(previous, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    previous = day;
  }
  return best;
}

export function earnedMilestones(dates: string[]): Milestone[] {
  const streak = longestStreak(dates);
  return MILESTONES.filter((milestone) => milestone.days <= streak);
}
