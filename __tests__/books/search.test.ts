import { BookSearchError, parseNdl, parseOpenLibrary, parseVolumes, searchBooks } from '../../src/books/search';

const response = {
  items: [
    { id: 'a', volumeInfo: { title: 'Mamba Mentality', authors: ['Kobe Bryant'], imageLinks: { thumbnail: 'http://books.google.com/a.jpg' } } },
    { id: 'b', volumeInfo: { authors: ['No Title'] } },
    { id: 'c', volumeInfo: { title: 'No Cover' } },
  ],
};

const openLibrary = { docs: [{ key: '/works/OL1W', title: 'The Mamba mentality', author_name: ['Kobe Bryant'], cover_i: 9261036 }, { key: '/works/OL2W' }] };

const ndlXml = `<?xml version="1.0"?><rss><channel>
<item>
  <title>KOBE BRYANT THE MAMBA MENTALITY : HOW I PLAY</title>
  <dc:creator>Bryant, Kobe, 1978-2020</dc:creator>
  <dc:creator>島本, 和彦</dc:creator>
  <dc:identifier xsi:type="dcndl:ISBN">978-4-7816-1767-1</dc:identifier>
  <dc:identifier xsi:type="dcndl:NDLBibID">029550864</dc:identifier>
</item>
<item><title>ISBN &amp; 表紙なし</title></item>
</channel></rss>`;

type Reply = { ok: boolean; status: number; body: unknown };
const mockFetch = (replies: Reply[]) => {
  let call = 0;
  return jest.fn(async () => {
    const reply = replies[Math.min(call++, replies.length - 1)];
    return { ok: reply.ok, status: reply.status, json: async () => reply.body, text: async () => String(reply.body) };
  }) as unknown as typeof fetch;
};
const calls = (fetcher: typeof fetch) => (fetcher as jest.Mock).mock.calls.map((args: string[]) => args[0]);

describe('book search', () => {
  it('parses Google volumes, upgrades covers to https, and drops untitled results', () => {
    expect(parseVolumes(response)).toEqual([
      { title: 'Mamba Mentality', authors: 'Kobe Bryant', cover_url: 'https://books.google.com/a.jpg', external_id: 'a' },
      { title: 'No Cover', authors: null, cover_url: null, external_id: 'c' },
    ]);
    expect(parseVolumes({})).toEqual([]);
  });

  it('parses Open Library docs with cover ids', () => {
    expect(parseOpenLibrary(openLibrary)).toEqual([
      { title: 'The Mamba mentality', authors: 'Kobe Bryant', cover_url: 'https://covers.openlibrary.org/b/id/9261036-M.jpg', external_id: 'ol:/works/OL1W' },
    ]);
  });

  it('parses NDL XML, strips birth years and builds an ISBN cover url', () => {
    expect(parseNdl(ndlXml)).toEqual([
      { title: 'KOBE BRYANT THE MAMBA MENTALITY : HOW I PLAY', authors: 'Bryant Kobe, 島本 和彦', cover_url: 'https://covers.openlibrary.org/b/isbn/9784781617671-M.jpg?default=false', external_id: 'isbn:9784781617671' },
      { title: 'ISBN & 表紙なし', authors: null, cover_url: null, external_id: null },
    ]);
  });

  it('skips the network for blank queries and encodes the query', async () => {
    const fetcher = mockFetch([{ ok: true, status: 200, body: response }]);
    expect(await searchBooks('   ', fetcher)).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
    await searchBooks('コービー 本', fetcher);
    expect(calls(fetcher)).toHaveLength(1);
    expect(calls(fetcher)[0]).toContain(encodeURIComponent('コービー 本'));
  });

  it('falls back to Open Library when Google is over quota', async () => {
    const fetcher = mockFetch([{ ok: false, status: 429, body: {} }, { ok: true, status: 200, body: openLibrary }]);
    expect(await searchBooks('mamba', fetcher)).toHaveLength(1);
    expect(calls(fetcher)[1]).toContain('openlibrary.org');
  });

  it('falls back to NDL when the others return nothing', async () => {
    const fetcher = mockFetch([{ ok: false, status: 429, body: {} }, { ok: true, status: 200, body: {} }, { ok: true, status: 200, body: ndlXml }]);
    expect((await searchBooks('マンバ', fetcher))[0].external_id).toBe('isbn:9784781617671');
    expect(calls(fetcher)[2]).toContain('ndlsearch.ndl.go.jp');
  });

  it('reports quota when every source fails and one was 429', async () => {
    const fetcher = mockFetch([{ ok: false, status: 429, body: {} }, { ok: false, status: 500, body: {} }]);
    await expect(searchBooks('x', fetcher)).rejects.toMatchObject({ kind: 'quota', message: expect.stringContaining('429') });
  });

  it('reports offline when no request reaches the network', async () => {
    const fetcher = jest.fn(async () => { throw new TypeError('Network request failed'); }) as unknown as typeof fetch;
    const error = await searchBooks('x', fetcher).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BookSearchError);
    expect((error as BookSearchError).kind).toBe('offline');
  });
});
