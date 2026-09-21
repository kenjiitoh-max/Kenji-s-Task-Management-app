import { Deal, DealKind } from '../db/types';

export const dealKinds: DealKind[] = ['new', 'renewal'];
export const dealKindLabels: Record<DealKind, string> = { new: 'New ACV', renewal: 'Renewal ACV' };
export const commissionRates: Record<DealKind, number> = { new: 0.08, renewal: 0.04 };

/** 年度は 2 月始まり。Q1=2-4月, Q2=5-7月, Q3=8-10月, Q4=11-1月 */
export const FISCAL_START_MONTH = 2;
export const PAYOUT_DAY = 28;

export interface FiscalQuarter {
  fiscalYear: number;
  quarter: 1 | 2 | 3 | 4;
  start: string;
  end: string;
  payoutDate: string;
  label: string;
}

const pad = (value: number) => String(value).padStart(2, '0');
const iso = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const parse = (date: string) => date.split('-').map(Number) as [number, number, number];

export function fiscalYearOf(date: string): number {
  const [year, month] = parse(date);
  return month >= FISCAL_START_MONTH ? year : year - 1;
}

export function fiscalYearRange(fiscalYear: number): { start: string; end: string } {
  return { start: iso(fiscalYear, FISCAL_START_MONTH, 1), end: iso(fiscalYear + 1, FISCAL_START_MONTH, 0) };
}

export function quarterOf(date: string): FiscalQuarter {
  const fiscalYear = fiscalYearOf(date);
  const [, month] = parse(date);
  const offset = (month - FISCAL_START_MONTH + 12) % 12;
  const quarter = (Math.floor(offset / 3) + 1) as 1 | 2 | 3 | 4;
  return quarterFor(fiscalYear, quarter);
}

export function quarterFor(fiscalYear: number, quarter: 1 | 2 | 3 | 4): FiscalQuarter {
  const startMonth = FISCAL_START_MONTH + (quarter - 1) * 3;
  return {
    fiscalYear,
    quarter,
    start: iso(fiscalYear, startMonth, 1),
    end: iso(fiscalYear, startMonth + 3, 0),
    payoutDate: iso(fiscalYear, startMonth + 3, PAYOUT_DAY),
    label: `FY${fiscalYear} Q${quarter}`,
  };
}

export function commissionJpy(deal: Pick<Deal, 'kind' | 'amount_usd' | 'fx_rate'>): number {
  return Math.round(deal.amount_usd * deal.fx_rate * commissionRates[deal.kind]);
}

export function dealJpy(deal: Pick<Deal, 'amount_usd' | 'fx_rate'>): number {
  return Math.round(deal.amount_usd * deal.fx_rate);
}

export interface FiscalSummary {
  fiscalYear: number;
  newUsd: number;
  renewalUsd: number;
  totalUsd: number;
  totalJpy: number;
  commissionJpy: number;
  dealCount: number;
}

export function summarizeFiscalYear(deals: Deal[], fiscalYear: number): FiscalSummary {
  const inYear = deals.filter((deal) => fiscalYearOf(deal.closed_on) === fiscalYear);
  const sum = (kind: DealKind) => inYear.filter((deal) => deal.kind === kind).reduce((total, deal) => total + deal.amount_usd, 0);
  return {
    fiscalYear,
    newUsd: sum('new'),
    renewalUsd: sum('renewal'),
    totalUsd: sum('new') + sum('renewal'),
    totalJpy: inYear.reduce((total, deal) => total + dealJpy(deal), 0),
    commissionJpy: inYear.reduce((total, deal) => total + commissionJpy(deal), 0),
    dealCount: inYear.length,
  };
}

/** 日ごとの累計 (USD)。グラフ用 */
export function cumulativeByDay(deals: Deal[], fiscalYear: number): { date: string; totalUsd: number }[] {
  const points: { date: string; totalUsd: number }[] = [];
  let running = 0;
  for (const deal of [...deals].filter((deal) => fiscalYearOf(deal.closed_on) === fiscalYear).sort((a, b) => a.closed_on.localeCompare(b.closed_on))) {
    running += deal.amount_usd;
    const last = points[points.length - 1];
    if (last && last.date === deal.closed_on) last.totalUsd = running;
    else points.push({ date: deal.closed_on, totalUsd: running });
  }
  return points;
}

export interface QuarterPayout extends FiscalQuarter {
  newUsd: number;
  renewalUsd: number;
  commissionJpy: number;
  dealCount: number;
  paid: boolean;
}

export function quarterPayouts(deals: Deal[], fiscalYear: number, today: string): QuarterPayout[] {
  return ([1, 2, 3, 4] as const).map((quarter) => {
    const period = quarterFor(fiscalYear, quarter);
    const inQuarter = deals.filter((deal) => deal.closed_on >= period.start && deal.closed_on <= period.end);
    return {
      ...period,
      newUsd: inQuarter.filter((deal) => deal.kind === 'new').reduce((total, deal) => total + deal.amount_usd, 0),
      renewalUsd: inQuarter.filter((deal) => deal.kind === 'renewal').reduce((total, deal) => total + deal.amount_usd, 0),
      commissionJpy: inQuarter.reduce((total, deal) => total + commissionJpy(deal), 0),
      dealCount: inQuarter.length,
      paid: period.payoutDate < today,
    };
  });
}

/** 次に振り込まれる支払い (今日以降の支払日で最も近いもの) */
export function nextPayout(deals: Deal[], today: string): QuarterPayout {
  const current = quarterOf(today);
  const candidates = [...quarterPayouts(deals, current.fiscalYear - 1, today), ...quarterPayouts(deals, current.fiscalYear, today)];
  return candidates.find((payout) => !payout.paid) ?? candidates[candidates.length - 1];
}

export interface Rank {
  title: string;
  emoji: string;
  minUsd: number;
}

export const ranks: Rank[] = [
  { title: 'ルーキー', emoji: '🎯', minUsd: 0 },
  { title: 'ハンター', emoji: '🏹', minUsd: 50_000 },
  { title: 'クローザー', emoji: '⚔️', minUsd: 150_000 },
  { title: 'エース', emoji: '🔥', minUsd: 300_000 },
  { title: 'マンバ', emoji: '🐍', minUsd: 600_000 },
  { title: 'レジェンド', emoji: '👑', minUsd: 1_000_000 },
];

export function rankFor(totalUsd: number): { current: Rank; next: Rank | null; progress: number } {
  const index = ranks.reduce((found, rank, i) => (totalUsd >= rank.minUsd ? i : found), 0);
  const current = ranks[index];
  const next = ranks[index + 1] ?? null;
  const progress = next ? Math.min(1, (totalUsd - current.minUsd) / (next.minUsd - current.minUsd)) : 1;
  return { current, next, progress };
}

/** 案件の大きさに応じた戦利品アイコン */
export function lootFor(amountUsd: number): string {
  if (amountUsd >= 200_000) return '👑';
  if (amountUsd >= 100_000) return '🏆';
  if (amountUsd >= 50_000) return '💎';
  if (amountUsd >= 20_000) return '🥇';
  if (amountUsd >= 5_000) return '💰';
  return '🪙';
}

export const formatUsd = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
export const formatJpy = (value: number) => `¥${Math.round(value).toLocaleString('ja-JP')}`;
