import { Quote, quotes } from './quotes';

export function quoteForDate(date: string): Quote {
  let hash = 0;
  for (const character of date) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return quotes[hash % quotes.length];
}

export function randomQuote(exclude?: string): Quote {
  if (quotes.length === 1) return quotes[0];
  let quote = quotes[Math.floor(Math.random() * quotes.length)];
  while (quote.id === exclude) quote = quotes[Math.floor(Math.random() * quotes.length)];
  return quote;
}
