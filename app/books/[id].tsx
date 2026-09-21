import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookCover } from '../../src/components/BookCover';
import { BookSearchModal } from '../../src/components/BookSearchModal';
import { Celebration } from '../../src/components/Celebration';
import { Fab } from '../../src/components/Fab';
import { addBook, bookStatusLabels, bookStatuses, deleteBook, listBooks, setBookStatus } from '../../src/db/books';
import { getCategory } from '../../src/db/categories';
import { countCompletions } from '../../src/db/dailyActions';
import { getDb } from '../../src/db/database';
import { Book, BookStatus, Category } from '../../src/db/types';
import { getLevelState } from '../../src/growth/levels';
import { useCelebration } from '../../src/hooks/useCelebration';
import { cardSurface, getPalette, radius, shadow } from '../../src/theme';

const shelfEmoji: Record<BookStatus, string> = { reading: '📖', want: '🔖', done: '✅' };

export default function BookshelfScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);
  const dark = useColorScheme() === 'dark';
  const palette = getPalette(dark ? 'dark' : 'light');
  const [category, setCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchModal, setSearchModal] = useState(false);
  const celebration = useCelebration();
  const refresh = useCallback(() => {
    const db = getDb();
    setCategory(getCategory(db, categoryId));
    setBooks(listBooks(db, categoryId));
  }, [categoryId]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  if (!category) return null;
  const withXp = (action: () => void) => {
    const db = getDb();
    const before = getLevelState('reader', countCompletions(db, categoryId));
    action();
    const after = getLevelState('reader', countCompletions(db, categoryId));
    refresh();
    if (after.totalXp > before.totalXp) {
      const message = after.level > before.level ? after.stage.name !== before.stage.name ? `進化！ ${after.stage.emoji} ${after.stage.name} になった！` : `レベルアップ！ Lv.${after.level}` : '読了！ +10 XP';
      celebration.celebrate(false, message);
    }
  };
  const openBook = (book: Book) => {
    Alert.alert(book.title, book.authors ?? undefined, [
      ...bookStatuses.filter((status) => status !== book.status).map((status) => ({ text: `${bookStatusLabels[status]}に移す`, onPress: () => withXp(() => setBookStatus(getDb(), book.id, status)) })),
      { text: '本棚から削除', style: 'destructive' as const, onPress: () => { deleteBook(getDb(), book.id); refresh(); } },
      { text: 'キャンセル', style: 'cancel' as const },
    ]);
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={24} color={palette.text} /></Pressable>
        <Text style={[styles.title, { color: palette.text }]}>本棚</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {(['reading', 'want', 'done'] as BookStatus[]).map((status) => {
          const shelf = books.filter((book) => book.status === status);
          return (
            <View key={status} style={[styles.shelf, shadow, cardSurface(palette)]}>
              <Text style={[styles.shelfTitle, { color: palette.text }]}>{shelfEmoji[status]} {bookStatusLabels[status]} <Text style={{ color: palette.muted }}>{shelf.length}</Text></Text>
              {shelf.length === 0 ? <Text style={[styles.empty, { color: palette.muted }]}>{status === 'done' ? '読み終えた本がここに並びます。' : '右下の＋から本を追加しましょう。'}</Text> : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.row}>
                    {shelf.map((book) => (
                      <Pressable accessibilityLabel={book.title} key={book.id} onPress={() => openBook(book)} style={styles.book}>
                        <BookCover dark={dark} title={book.title} url={book.cover_url} width={72} />
                        <Text numberOfLines={2} style={[styles.bookTitle, { color: palette.text }]}>{book.title}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
              <View style={[styles.plank, { backgroundColor: category.color }]} />
            </View>
          );
        })}
        <Text style={[styles.hint, { color: palette.muted }]}>本をタップすると棚を移動できます。読了にすると読書キャラに 10 XP。</Text>
      </ScrollView>
      <Fab color={category.color} onPress={() => setSearchModal(true)} />
      <BookSearchModal dark={dark} onAdd={(book, status) => withXp(() => addBook(getDb(), categoryId, book, status))} onClose={() => setSearchModal(false)} visible={searchModal} />
      <Celebration celebrationId={celebration.celebrationId} completeAll={celebration.completeAll} toastMessage={celebration.toastMessage} toastVisible={celebration.toastVisible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { marginRight: 12, padding: 4 },
  book: { width: 72 },
  bookTitle: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  content: { padding: 20, paddingBottom: 110 },
  empty: { fontSize: 13, paddingBottom: 8 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, paddingTop: 15 },
  hint: { fontSize: 12, textAlign: 'center' },
  plank: { borderRadius: 3, height: 6, marginTop: 10, opacity: 0.6 },
  row: { flexDirection: 'row', gap: 14, paddingBottom: 4 },
  safe: { flex: 1 },
  shelf: { borderRadius: radius.card, marginBottom: 16, padding: 16 },
  shelfTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800' },
});
