interface FrankfurterResponse {
  date?: string;
  rates?: { JPY?: number };
}

export interface FxQuote {
  rate: number;
  /** 実際にレートが公表された日 (週末・祝日は直前の営業日) */
  rateDate: string;
}

/** ECB 公表レート (frankfurter.dev、無料・キー不要)。土日は直前の営業日のレートが返る */
export async function fetchUsdJpy(date: string, fetcher: typeof fetch = fetch): Promise<FxQuote> {
  const response = await fetcher(`https://api.frankfurter.dev/v1/${date}?base=USD&symbols=JPY`);
  if (!response.ok) throw new Error(`為替レートの取得に失敗しました (${response.status})`);
  const body = (await response.json()) as FrankfurterResponse;
  const rate = body.rates?.JPY;
  if (!rate || !Number.isFinite(rate)) throw new Error('為替レートが見つかりません');
  return { rate, rateDate: body.date ?? date };
}
