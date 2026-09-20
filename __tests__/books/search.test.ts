import { parseVolumes, searchBooks } from '../../src/books/search';

const response = {
  items: [
    { id: 'a', volumeInfo: { title: 'Mamba Mentality', authors: ['Kobe Bryant'], imageLinks: { thumbnail: 'http://books.google.com/a.jpg' } } },
    { id: 'b', volumeInfo: { authors: ['No Title'] } },
    { id: 'c', volumeInfo: { title: 'No Cover' } },
  ],
};

describe('book search', () => {
  it('parses volumes, upgrades covers to https, and drops untitled results', () => {
    expect(parseVolumes(response)).toEqual([
      { title: 'Mamba Mentality', authors: 'Kobe Bryant', cover_url: 'https://books.google.com/a.jpg', external_id: 'a' },
      { title: 'No Cover', authors: null, cover_url: null, external_id: 'c' },
    ]);
    expect(parseVolumes({})).toEqual([]);
  });

  it('skips the network for blank queries and encodes the query', async () => {
    const fetcher = jest.fn(async () => ({ ok: true, status: 200, json: async () => response })) as unknown as typeof fetch;
    expect(await searchBooks('   ', fetcher)).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
    await searchBooks('コービー 本', fetcher);
    expect((fetcher as jest.Mock).mock.calls[0][0]).toContain(encodeURIComponent('コービー 本'));
  });

  it('throws on HTTP errors', async () => {
    const fetcher = jest.fn(async () => ({ ok: false, status: 429, json: async () => ({}) })) as unknown as typeof fetch;
    await expect(searchBooks('x', fetcher)).rejects.toThrow('429');
  });
});
