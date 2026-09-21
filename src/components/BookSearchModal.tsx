import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BookSearchError, searchBooks, SearchFailure } from '../books/search';
import { bookStatusLabels, bookStatuses, NewBook } from '../db/books';
import { BookStatus } from '../db/types';
import { getPalette, textOn } from '../theme';
import { BookCover } from './BookCover';
import { ModalShell } from './ModalShell';

const errorMessages: Record<SearchFailure, string> = {
  quota: '検索サービスが混み合っています (1日の上限)。時間をおくか、下のボタンでタイトルだけ追加できます。',
  offline: 'インターネットに接続できません。接続を確認するか、下のボタンでタイトルだけ追加できます。',
  failed: '検索できませんでした。下のボタンでタイトルだけ追加できます。',
};

export function BookSearchModal({ visible, dark, onClose, onAdd }: { visible: boolean; dark: boolean; onClose: () => void; onAdd: (book: NewBook, status: BookStatus) => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<BookStatus>('want');
  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      setResults(await searchBooks(query));
    } catch (caught) {
      const kind = caught instanceof BookSearchError ? caught.kind : 'failed';
      setError(errorMessages[kind]);
    } finally {
      setLoading(false);
    }
  };
  const addManually = () => { if (query.trim()) { onAdd({ title: query.trim(), authors: null, cover_url: null, external_id: null }, status); close(); } };
  const close = () => { setQuery(''); setResults([]); setError(null); onClose(); };
  return (
    <ModalShell dark={dark} onClose={close} title="本を追加" visible={visible}>
      <TextInput autoFocus onChangeText={setQuery} onSubmitEditing={search} placeholder="タイトルや著者で検索" placeholderTextColor={palette.muted} returnKeyType="search" style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={query} />
      <View style={styles.statusRow}>
        {bookStatuses.map((entry) => <Pressable key={entry} onPress={() => setStatus(entry)} style={[styles.chip, { backgroundColor: status === entry ? palette.primary : palette.input }]}><Text style={[styles.chipText, { color: status === entry ? textOn(palette.primary) : palette.text }]}>{bookStatusLabels[entry]}</Text></Pressable>)}
      </View>
      {loading ? <ActivityIndicator color={palette.primary} style={styles.loading} /> : null}
      {error ? <Text style={[styles.error, { color: palette.muted }]}>{error}</Text> : null}
      <FlatList
        data={results}
        keyboardShouldPersistTaps="handled"
        keyExtractor={(item, index) => item.external_id ?? `${item.title}-${index}`}
        ListEmptyComponent={!loading && query.trim() ? <Pressable onPress={addManually} style={[styles.manual, { borderColor: palette.border }]}><Text style={[styles.manualText, { color: palette.primary }]}>「{query.trim()}」を表紙なしで追加</Text></Pressable> : null}
        renderItem={({ item }) => (
          <Pressable onPress={() => { onAdd(item, status); close(); }} style={[styles.row, { borderBottomColor: palette.border }]}>
            <BookCover dark={dark} title={item.title} url={item.cover_url} width={44} />
            <View style={styles.rowText}>
              <Text numberOfLines={2} style={[styles.rowTitle, { color: palette.text }]}>{item.title}</Text>
              {item.authors ? <Text numberOfLines={1} style={[styles.rowAuthor, { color: palette.muted }]}>{item.authors}</Text> : null}
            </View>
          </Pressable>
        )}
        style={styles.list}
      />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: '700' },
  error: { fontSize: 13, marginBottom: 8 },
  input: { borderRadius: 12, fontSize: 16, marginBottom: 12, padding: 14 },
  list: { maxHeight: 360 },
  loading: { marginVertical: 12 },
  manual: { alignItems: 'center', borderRadius: 12, borderWidth: 1, marginTop: 8, padding: 14 },
  manualText: { fontSize: 14, fontWeight: '700' },
  row: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 12, paddingVertical: 10 },
  rowAuthor: { fontSize: 12, marginTop: 2 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
});
