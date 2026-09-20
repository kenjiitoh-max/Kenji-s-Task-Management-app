import { quoteForDate } from '../../src/quotes/dailyQuote';
import { quotes } from '../../src/quotes/quotes';

const normalizeQuoteText = (text: string): string =>
  text.toLocaleLowerCase().replace(/[\p{P}\p{S}\s]/gu, '');

describe('daily quotes', () => {
  it('returns the same quote for the same date', () => {
    expect(quoteForDate('2026-09-20')).toEqual(quoteForDate('2026-09-20'));
  });

  it('usually changes for different dates', () => {
    const dates = ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23'];
    expect(new Set(dates.map((date) => quoteForDate(date).id)).size).toBeGreaterThan(2);
  });

  it('has a complete unique dataset', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(100);
    expect(new Set(quotes.map((quote) => quote.id)).size).toBe(quotes.length);
    expect(new Set(quotes.map((quote) => normalizeQuoteText(quote.text))).size).toBe(quotes.length);
    expect(new Set(quotes.map((quote) => quote.story)).size).toBe(quotes.length);
    for (const quote of quotes) {
      expect(quote.text.trim()).not.toBe('');
      expect(quote.textJa.trim()).not.toBe('');
      expect(quote.author.trim()).not.toBe('');
      expect(quote.story.trim().length).toBeGreaterThanOrEqual(40);
    }
  });
});
