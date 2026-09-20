import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { countBooksByStatus, listBooks } from '../db/books';
import { getDb } from '../db/database';
import { Book, BookStatus } from '../db/types';
import { getPalette, radius, shadow } from '../theme';
import { BookCover } from './BookCover';

export function BookshelfCard({ dark, accent, categoryId, onPress }: { dark: boolean; accent: string; categoryId: number; onPress: () => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [reading, setReading] = useState<Book[]>([]);
  const [counts, setCounts] = useState<Record<BookStatus, number>>({ want: 0, reading: 0, done: 0 });
  useFocusEffect(useCallback(() => {
    const db = getDb();
    setReading(listBooks(db, categoryId).filter((book) => book.status === 'reading').slice(0, 4));
    setCounts(countBooksByStatus(db, categoryId));
  }, [categoryId]));
  return (
    <Pressable accessibilityLabel="本棚を開く" onPress={onPress} style={[styles.card, shadow, { backgroundColor: palette.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>📚 本棚</Text>
        <Ionicons color={palette.muted} name="chevron-forward" size={20} />
      </View>
      <Text style={[styles.counts, { color: palette.muted }]}>読んでる {counts.reading} ・ 読みたい {counts.want} ・ 読了 {counts.done}</Text>
      {reading.length > 0 ? (
        <View style={styles.row}>{reading.map((book) => <BookCover dark={dark} key={book.id} title={book.title} url={book.cover_url} width={48} />)}</View>
      ) : <Text style={[styles.empty, { color: palette.muted }]}>いま読んでいる本を登録しよう。</Text>}
      <View style={[styles.plank, { backgroundColor: accent }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, marginBottom: 24, padding: 18 },
  counts: { fontSize: 13, marginBottom: 12, marginTop: 4 },
  empty: { fontSize: 13 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  plank: { borderRadius: 3, height: 6, marginTop: 10, opacity: 0.6 },
  row: { flexDirection: 'row', gap: 10 },
  title: { fontSize: 18, fontWeight: '800' },
});
