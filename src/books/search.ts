import { NewBook } from '../db/books';

interface VolumeInfo {
  title?: string;
  authors?: string[];
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
}

interface Volume {
  id: string;
  volumeInfo?: VolumeInfo;
}

export interface BooksResponse {
  items?: Volume[];
}

export interface OpenLibraryResponse {
  docs?: { key?: string; title?: string; author_name?: string[]; cover_i?: number }[];
}

export type SearchFailure = 'quota' | 'offline' | 'failed';

export class BookSearchError extends Error {
  constructor(
    public readonly kind: SearchFailure,
    message: string,
  ) {
    super(message);
  }
}

export function parseVolumes(response: BooksResponse): NewBook[] {
  return (response.items ?? [])
    .filter((volume) => volume.volumeInfo?.title)
    .map((volume) => {
      const info = volume.volumeInfo!;
      const thumbnail = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail ?? null;
      return {
        title: info.title!,
        authors: info.authors?.join(', ') ?? null,
        cover_url: thumbnail ? thumbnail.replace(/^http:/, 'https:') : null,
        external_id: volume.id,
      };
    });
}

export function parseOpenLibrary(response: OpenLibraryResponse): NewBook[] {
  return (response.docs ?? [])
    .filter((doc) => doc.title)
    .map((doc) => ({
      title: doc.title!,
      authors: doc.author_name?.join(', ') ?? null,
      cover_url: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      external_id: doc.key ? `ol:${doc.key}` : null,
    }));
}

const decodeXml = (text: string) =>
  text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

const tagValues = (xml: string, tag: string) =>
  Array.from(xml.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g'))).map((match) => decodeXml(match[1]));

export function parseNdl(xml: string): NewBook[] {
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
    .map((match) => match[1])
    .filter((item) => tagValues(item, 'title')[0])
    .map((item) => {
      const isbn = item.match(/<dc:identifier[^>]*dcndl:ISBN[^>]*>([^<]*)</)?.[1].replace(/-/g, '') ?? null;
      const authors = tagValues(item, 'dc:creator').map((name) => name.replace(/,\s*\d{4}-(\d{4})?$/, '').replace(/,\s*/g, ' '));
      return {
        title: tagValues(item, 'title')[0],
        authors: authors.length ? Array.from(new Set(authors)).join(', ') : null,
        cover_url: isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false` : null,
        external_id: isbn ? `isbn:${isbn}` : null,
      };
    });
}

const encode = (query: string) => encodeURIComponent(query);

const sources: { name: string; url: (query: string) => string; parse: (response: Response) => Promise<NewBook[]> }[] = [
  {
    name: 'Google Books',
    url: (query) => `https://www.googleapis.com/books/v1/volumes?q=${encode(query)}&maxResults=10&printType=books`,
    parse: async (response) => parseVolumes((await response.json()) as BooksResponse),
  },
  {
    name: 'Open Library',
    url: (query) => `https://openlibrary.org/search.json?q=${encode(query)}&limit=10&fields=key,title,author_name,cover_i`,
    parse: async (response) => parseOpenLibrary((await response.json()) as OpenLibraryResponse),
  },
  {
    name: '国立国会図書館',
    url: (query) => `https://ndlsearch.ndl.go.jp/api/opensearch?any=${encode(query)}&cnt=10`,
    parse: async (response) => parseNdl(await response.text()),
  },
];

export async function searchBooks(query: string, fetcher: typeof fetch = fetch): Promise<NewBook[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let quotaHit = false;
  let reachedNetwork = false;
  const failures: string[] = [];

  for (const source of sources) {
    try {
      const response = await fetcher(source.url(trimmed));
      reachedNetwork = true;
      if (!response.ok) {
        if (response.status === 429) quotaHit = true;
        failures.push(`${source.name}: ${response.status}`);
        continue;
      }
      const books = await source.parse(response);
      if (books.length) return books;
    } catch (error) {
      failures.push(`${source.name}: ${error instanceof Error ? error.message : 'error'}`);
    }
  }

  if (!reachedNetwork) throw new BookSearchError('offline', `インターネットに接続できません (${failures.join(', ')})`);
  if (failures.length === sources.length) {
    throw new BookSearchError(quotaHit ? 'quota' : 'failed', `本の検索に失敗しました (${failures.join(', ')})`);
  }
  return [];
}
