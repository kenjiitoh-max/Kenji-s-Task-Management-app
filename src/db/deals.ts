import { Db } from './Db';
import { localTimestamp } from './time';
import { Deal, DealKind } from './types';

export interface NewDeal {
  kind: DealKind;
  amount_usd: number;
  closed_on: string;
  fx_rate: number;
  fx_date: string;
  memo?: string | null;
}

export function listDeals(db: Db): Deal[] {
  return db.getAllSync<Deal>('SELECT * FROM deals ORDER BY closed_on DESC, id DESC');
}

export function addDeal(db: Db, deal: NewDeal, now = new Date()): number {
  return db.runSync(
    'INSERT INTO deals (kind, amount_usd, closed_on, fx_rate, fx_date, memo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    deal.kind,
    deal.amount_usd,
    deal.closed_on,
    deal.fx_rate,
    deal.fx_date,
    deal.memo?.trim() || null,
    localTimestamp(now),
  ).lastInsertRowId;
}

export function deleteDeal(db: Db, id: number): void {
  db.runSync('DELETE FROM deals WHERE id = ?', id);
}
