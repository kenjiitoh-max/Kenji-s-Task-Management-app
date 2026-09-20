import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { CategoryCard } from '../src/components/CategoryCard';
import { CategoryFormModal } from '../src/components/CategoryFormModal';
import { Fab } from '../src/components/Fab';
import { createCategory, getCategoryProgress, listCategories } from '../src/db/categories';
import { getDb } from '../src/db/database';
import { ensureDailyReset } from '../src/db/dailyActions';
import { Category } from '../src/db/types';
import { getPalette } from '../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const dark = useColorScheme() === 'dark';
  const palette = getPalette(dark ? 'dark' : 'light');
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Record<number, { total: number; completed: number }>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const refresh = useCallback(() => {
    const db = getDb();
    ensureDailyReset(db);
    const items = listCategories(db);
    setCategories(items);
    setProgress(Object.fromEntries(items.map((item) => [item.id, getCategoryProgress(db, item.id)])));
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  const date = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}><View><Text style={[styles.kicker, { color: palette.muted }]}>{date}</Text><Text style={[styles.title, { color: palette.text }]}>My Goals</Text></View></View>
      <FlatList contentContainerStyle={styles.list} data={categories} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <CategoryCard category={item} dark={dark} onPress={() => router.push(`/category/${item.id}`)} progress={progress[item.id] || { total: 0, completed: 0 }} />} ListEmptyComponent={<Text style={[styles.empty, { color: palette.muted }]}>カテゴリーを追加して、今日の一歩を始めましょう。</Text>} />
      <Fab color={palette.primary} onPress={() => setModalVisible(true)} />
      <CategoryFormModal dark={dark} onClose={() => setModalVisible(false)} onSave={(name, color) => { createCategory(getDb(), name, color); refresh(); }} visible={modalVisible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 15, paddingHorizontal: 8, paddingTop: 40, textAlign: 'center' },
  header: { paddingHorizontal: 22, paddingTop: 20 },
  kicker: { fontSize: 14, marginBottom: 6 },
  list: { padding: 22, paddingBottom: 100 },
  safe: { flex: 1 },
  title: { fontSize: 34, fontWeight: '800' },
});
