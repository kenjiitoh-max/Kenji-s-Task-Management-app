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

export async function searchBooks(query: string, fetcher: typeof fetch = fetch): Promise<NewBook[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=10&printType=books`;
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`本の検索に失敗しました (${response.status})`);
  return parseVolumes((await response.json()) as BooksResponse);
}
