import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryCard } from '../src/components/CategoryCard';
import { CategoryFormModal } from '../src/components/CategoryFormModal';
import { Fab } from '../src/components/Fab';
import { DealVaultCard } from '../src/components/DealVaultCard';
import { QuoteCard } from '../src/components/QuoteCard';
import { createCategory, getCategoryProgress, listCategories } from '../src/db/categories';
import { countCompletions, ensureDailyReset, listActionStreaks } from '../src/db/dailyActions';
import { getLatestBodyRecord, getBodyProfile } from '../src/db/bodyRecords';
import { getDb } from '../src/db/database';
import { listDeals } from '../src/db/deals';
import { listFavoriteIds, toggleFavorite } from '../src/db/quoteFavorites';
import { getBodyStatus } from '../src/body/bodyMetrics';
import { getLevelState, isLineage } from '../src/growth/levels';
import { subscribe } from '../src/db/dailyResetEvents';
import { Category, Deal } from '../src/db/types';
import { BodyAvatar } from '../src/components/BodyAvatar';
import { getPalette } from '../src/theme';
import { quoteForDate } from '../src/quotes/dailyQuote';
import { localDate } from '../src/db/time';

export default function HomeScreen() {
  const router = useRouter();
  const dark = true;
  const palette = getPalette(dark ? 'dark' : 'light');
  const [categories, setCategories] = useState<Category[]>([]);
  const [progress, setProgress] = useState<Record<number, { total: number; completed: number }>>({});
  const [subtitles, setSubtitles] = useState<Record<number, { subtitle?: string; emoji?: string; bodyStage?: string }>>({});
  const [streaks, setStreaks] = useState<Record<number, { id: number; title: string; streak: number }[]>>({});
  const [favoriteQuote, setFavoriteQuote] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const refresh = useCallback(() => {
    const db = getDb();
    ensureDailyReset(db);
    const items = listCategories(db);
    setCategories(items);
    setProgress(Object.fromEntries(items.map((item) => [item.id, getCategoryProgress(db, item.id)])));
    setStreaks(Object.fromEntries(items.map((item) => [item.id, listActionStreaks(db, item.id)])));
    const profile = getBodyProfile(db);
    const latest = getLatestBodyRecord(db);
    setFavoriteQuote(listFavoriteIds(db).includes(quoteForDate(localDate()).id));
    setDeals(listDeals(db));
    setSubtitles(Object.fromEntries(items.map((item) => {
      if (item.kind === 'weight') {
        if (!latest) return [item.id, { subtitle: profile.height_cm ? '今日の体重を記録しよう' : '身長を設定して始めよう', emoji: '⚖️' }];
        const status = profile.height_cm ? getBodyStatus(latest.weight_kg, latest.body_fat_pct, profile.height_cm, profile.sex) : null;
        return [item.id, { subtitle: `${latest.weight_kg.toFixed(1)} kg${status ? ` · ${status.bmiStage.label}` : ''}`, emoji: status?.bmiStage.emoji || '⚖️', bodyStage: status?.bmiStage.key }];
      }
      if (isLineage(item.kind)) {
        const state = getLevelState(item.kind, countCompletions(db, item.id));
        return [item.id, { subtitle: `Lv.${state.level} ${state.stage.name}`, emoji: state.stage.emoji }];
      }
      return [item.id, {}];
    })));
  }, []);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => subscribe(refresh), [refresh]);
  const date = new Intl.DateTimeFormat('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}><View><Text style={[styles.kicker, { color: palette.muted }]}>{date}</Text><Text style={[styles.greeting, { color: palette.muted }]}>今日も小さな一歩から</Text><Text style={[styles.title, { color: palette.text }]}>My Goals</Text></View></View>
      <FlatList contentContainerStyle={styles.list} data={categories} keyExtractor={(item) => String(item.id)} ListHeaderComponent={<><QuoteCard dark={dark} favorite={favoriteQuote} onPress={() => router.push({ pathname: '/quotes', params: { id: quoteForDate(localDate()).id } })} onToggleFavorite={() => { const quote = quoteForDate(localDate()); setFavoriteQuote(toggleFavorite(getDb(), quote.id)); }} quote={quoteForDate(localDate())} /><DealVaultCard dark={dark} deals={deals} onPress={() => router.push('/deals')} today={localDate()} /></>} renderItem={({ item }) => { const bodyStage = subtitles[item.id]?.bodyStage; return <CategoryCard category={item} character={bodyStage ? <BodyAvatar seed={item.id} size={56} stageKey={bodyStage} /> : undefined} dark={dark} emoji={subtitles[item.id]?.emoji} onPress={() => router.push(`/category/${item.id}`)} progress={progress[item.id] || { total: 0, completed: 0 }} streaks={streaks[item.id]} subtitle={subtitles[item.id]?.subtitle} />; }} ListEmptyComponent={<Text style={[styles.empty, { color: palette.muted }]}>カテゴリーを追加して、今日の一歩を始めましょう。</Text>} />
      <Fab color={palette.primary} onPress={() => setModalVisible(true)} />
      <CategoryFormModal dark={dark} onClose={() => setModalVisible(false)} onSave={(name, color) => { createCategory(getDb(), name, color); refresh(); }} visible={modalVisible} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 15, paddingHorizontal: 8, paddingTop: 40, textAlign: 'center' },
  header: { paddingHorizontal: 22, paddingTop: 20 },
  greeting: { fontSize: 14, marginBottom: 2 },
  kicker: { fontSize: 14, marginBottom: 6 },
  list: { padding: 22, paddingBottom: 100 },
  safe: { flex: 1 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: 0.3 },
});
