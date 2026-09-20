import { levelFromXp, xpFromCompletions } from './levels';

export type HistoryPoint = { x: string; y: number };

export function shiftDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function datePart(timestamp: string): string {
  return timestamp.slice(0, 10);
}

export function dailyCompletionCounts(dates: string[], days: number, today: string): HistoryPoint[] {
  const counts = new Map<string, number>();
  dates.forEach((date) => {
    const day = datePart(date);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  return Array.from({ length: Math.max(0, days) }, (_, index) => {
    const day = shiftDate(today, index - days + 1);
    return { x: day, y: counts.get(day) ?? 0 };
  });
}

export function xpTrajectory(dates: string[]): { points: HistoryPoint[]; levelUps: { x: string; level: number }[] } {
  const grouped = new Map<string, number>();
  dates.forEach((date) => {
    const day = datePart(date);
    grouped.set(day, (grouped.get(day) ?? 0) + 1);
  });
  let totalCompletions = 0;
  let previousLevel = 1;
  const points: HistoryPoint[] = [];
  const levelUps: { x: string; level: number }[] = [];
  [...grouped.keys()].sort().forEach((day) => {
    totalCompletions += grouped.get(day) ?? 0;
    const totalXp = xpFromCompletions(totalCompletions);
    const level = levelFromXp(totalXp).level;
    points.push({ x: day, y: totalXp });
    if (level > previousLevel) levelUps.push({ x: day, level });
    previousLevel = level;
  });
  return { points, levelUps };
}

export function currentStreak(dates: string[], today: string): number {
  const completedDays = new Set(dates.map(datePart));
  let day = completedDays.has(today) ? today : shiftDate(today, -1);
  let streak = 0;
  while (completedDays.has(day)) {
    streak += 1;
    day = shiftDate(day, -1);
  }
  return streak;
}
