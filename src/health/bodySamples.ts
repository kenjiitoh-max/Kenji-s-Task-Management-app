import { localDate } from '../db/time';

export type HealthSample = { quantity: number; endDate: Date | string };
export type ImportedBodyRecord = { date: string; weightKg: number; bodyFatPct: number | null };

export function localDateOf(d: Date | string): string {
  return localDate(typeof d === 'string' ? new Date(d) : d);
}

export function normalizeFatPct(q: number): number {
  const pct = q <= 1 ? q * 100 : q;
  return Math.round(pct * 10) / 10;
}

function latestByDate(samples: HealthSample[]): Map<string, HealthSample> {
  const byDay = new Map<string, HealthSample>();
  for (const sample of samples) {
    const day = localDateOf(sample.endDate);
    const current = byDay.get(day);
    if (!current || new Date(sample.endDate).getTime() > new Date(current.endDate).getTime()) {
      byDay.set(day, sample);
    }
  }
  return byDay;
}

export function mergeBodySamples(weights: HealthSample[], fats: HealthSample[]): ImportedBodyRecord[] {
  const weightByDay = latestByDate(weights);
  const fatByDay = latestByDate(fats);
  return [...weightByDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, sample]) => {
      const fat = fatByDay.get(date);
      return {
        date,
        weightKg: Math.round(sample.quantity * 10) / 10,
        bodyFatPct: fat ? normalizeFatPct(fat.quantity) : null,
      };
    });
}
