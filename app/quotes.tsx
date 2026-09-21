import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listFavoriteIds, toggleFavorite } from '../src/db/quoteFavorites';
import { getDb } from '../src/db/database';
import { Quote, QuoteTag, quotes } from '../src/quotes/quotes';
import { cardSurface, getPalette, radius, shadow } from '../src/theme';

type Filter = 'all' | 'favorites' | QuoteTag;

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'favorites', label: 'お気に入り' },
  { key: 'mamba', label: 'Mamba' },
  { key: 'work', label: '仕事' },
  { key: 'resilience', label: '折れない心' },
  { key: 'focus', label: '集中' },
  { key: 'learning', label: '学び' },
  { key: 'health', label: '健康' },
];

export default function QuotesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dark = true;
  const palette = getPalette(dark ? 'dark' : 'light');
  const listRef = useRef<FlatList<Quote>>(null);
  const hasRetriedScrollRef = useRef(false);
  const didInitialScroll = useRef(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(id || null);
  const filteredQuotes = useMemo(() => quotes.filter((quote) => filter === 'all' || (filter === 'favorites' ? favoriteIds.has(quote.id) : quote.tags.includes(filter))), [favoriteIds, filter]);
  useFocusEffect(useCallback(() => {
    setFavoriteIds(new Set(listFavoriteIds(getDb())));
  }, []));
  useEffect(() => {
    if (!id || didInitialScroll.current) return;
    const index = filteredQuotes.findIndex((quote) => quote.id === id);
    if (index >= 0) {
      didInitialScroll.current = true;
      hasRetriedScrollRef.current = false;
      setExpandedId(id);
      const timer = setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 }), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [filteredQuotes, id]);
  const toggle = (quoteId: string) => {
    const next = new Set(favoriteIds);
    if (toggleFavorite(getDb(), quoteId)) next.add(quoteId);
    else next.delete(quoteId);
    setFavoriteIds(next);
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color={palette.text} /></Pressable><Text style={[styles.title, { color: palette.text }]}>金言のライブラリ</Text></View>
      <FlatList
        ref={listRef}
        contentContainerStyle={styles.content}
        data={filteredQuotes}
        keyExtractor={(quote) => quote.id}
        ListHeaderComponent={<FlatList horizontal contentContainerStyle={styles.filterContent} data={filters} keyExtractor={(item) => item.key} renderItem={({ item }) => <Pressable onPress={() => setFilter(item.key)} style={[styles.filter, { backgroundColor: filter === item.key ? palette.primary : palette.card }]}><Text style={{ color: filter === item.key ? '#fff' : palette.muted, fontSize: 12, fontWeight: '700' }}>{item.label}</Text></Pressable>} showsHorizontalScrollIndicator={false} />}
        ListEmptyComponent={<Text style={[styles.empty, { color: palette.muted }]}>お気に入りの金言はまだありません。</Text>}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          if (hasRetriedScrollRef.current) return;
          hasRetriedScrollRef.current = true;
          setTimeout(() => listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: true }), 100);
        }}
        renderItem={({ item }) => <Pressable onPress={() => setExpandedId(expandedId === item.id ? null : item.id)} style={[styles.quote, cardSurface(palette), shadow]}><View style={styles.quoteHeader}><Text style={[styles.author, { color: palette.text }]}>{item.authorJa}</Text><Pressable accessibilityLabel={favoriteIds.has(item.id) ? 'お気に入りから削除' : 'お気に入りに追加'} onPress={() => toggle(item.id)} style={styles.heart}><Ionicons name={favoriteIds.has(item.id) ? 'heart' : 'heart-outline'} size={21} color={favoriteIds.has(item.id) ? '#D97893' : palette.muted} /></Pressable></View><Text style={[styles.textJa, { color: palette.text }]}>「{item.textJa}」</Text><Text style={[styles.original, { color: palette.muted }]}>{item.text}</Text>{expandedId === item.id ? <Text style={[styles.story, { color: palette.muted }]}>{item.story}</Text> : null}</Pressable>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  author: { flex: 1, fontSize: 14, fontWeight: '800' },
  back: { marginRight: 12, padding: 4 },
  content: { padding: 20, paddingBottom: 30 },
  empty: { fontSize: 14, paddingTop: 40, textAlign: 'center' },
  filter: { borderRadius: 20, marginRight: 8, paddingHorizontal: 14, paddingVertical: 9 },
  filterContent: { paddingBottom: 18 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, paddingTop: 15 },
  heart: { padding: 5 },
  original: { fontSize: 12, lineHeight: 18, marginTop: 13 },
  quote: { borderRadius: radius.card, marginBottom: 12, padding: 17 },
  quoteHeader: { alignItems: 'center', flexDirection: 'row' },
  safe: { flex: 1 },
  story: { borderTopColor: '#00000012', borderTopWidth: 1, fontSize: 13, lineHeight: 21, marginTop: 15, paddingTop: 13 },
  textJa: { fontSize: 18, fontWeight: '600', lineHeight: 28, marginTop: 10 },
  title: { fontSize: 22, fontWeight: '800' },
});
