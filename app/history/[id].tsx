import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from '../../src/components/charts/BarChart';
import { LineChart } from '../../src/components/charts/LineChart';
import { listCompletionDates } from '../../src/db/dailyActions';
import { getDb } from '../../src/db/database';
import { listBodyRecordsAsc } from '../../src/db/bodyRecords';
import { localDate } from '../../src/db/time';
import { Category, BodyRecord } from '../../src/db/types';
import { getCategory } from '../../src/db/categories';
import { currentStreak, dailyCompletionCounts, shiftDate, xpTrajectory } from '../../src/growth/history';
import { isLineage, stageForLevel } from '../../src/growth/levels';
import { cardSurface, getPalette, radius, shadow, textOn } from '../../src/theme';

type Period = 30 | 90 | 'all';

function daysBetween(start: string, end: string): number {
  const startTime = new Date(`${start}T00:00:00`).getTime();
  const endTime = new Date(`${end}T00:00:00`).getTime();
  return Math.floor((endTime - startTime) / 86400000);
}

function formatDifference(first: number, latest: number, unit: string): string {
  const difference = latest - first;
  const sign = difference < 0 ? '−' : difference > 0 ? '+' : '';
  return `最初 ${first.toFixed(1)} ${unit} → 最新 ${latest.toFixed(1)} ${unit}（差分 ${sign}${Math.abs(difference).toFixed(1)} ${unit}）`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categoryId = Number(id);
  const dark = useColorScheme() === 'dark';
  const palette = getPalette(dark ? 'dark' : 'light');
  const [category, setCategory] = useState<Category | null>(null);
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [completionDates, setCompletionDates] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>(30);

  const refresh = useCallback(() => {
    const db = getDb();
    const nextCategory = getCategory(db, categoryId);
    setCategory(nextCategory);
    setRecords(nextCategory?.kind === 'weight' ? listBodyRecordsAsc(db) : []);
    setCompletionDates(listCompletionDates(db, categoryId));
  }, [categoryId]);
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  if (!category) return null;
  const today = localDate();
  const sinceDate = period === 'all' ? null : shiftDate(today, -(period - 1));
  const periodRecords = records.filter((record) => !sinceDate || record.date >= sinceDate);
  const periodDates = completionDates.filter((date) => !sinceDate || date.slice(0, 10) >= sinceDate);
  const activityDays = period === 'all' && periodDates.length
    ? Math.max(30, daysBetween(periodDates[0].slice(0, 10), today) + 1)
    : period === 'all' ? 0 : period;
  const activityPoints = periodDates.length ? dailyCompletionCounts(periodDates, activityDays, today) : [];
  const trajectory = xpTrajectory(completionDates);
  const weightPoints = periodRecords.map((record) => ({ x: record.date, y: record.weight_kg }));
  const fatPoints = periodRecords.filter((record) => record.body_fat_pct != null).map((record) => ({ x: record.date, y: record.body_fat_pct as number }));
  const lineage = isLineage(category.kind) ? category.kind : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Ionicons color={palette.text} name="arrow-back" size={24} /></Pressable>
        <View style={[styles.dot, { backgroundColor: category.color }]} />
        <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>{category.name} の履歴</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.periods}>
          {([30, 90, 'all'] as Period[]).map((value) => <Pressable key={value} onPress={() => setPeriod(value)} style={[styles.period, { backgroundColor: period === value ? category.color : palette.card }]}><Text style={{ color: period === value ? textOn(category.color) : palette.muted, fontSize: 12, fontWeight: '700' }}>{value === 'all' ? '全期間' : `${value}日`}</Text></Pressable>)}
        </View>
        {category.kind === 'weight' ? <>
          <HistoryCard palette={palette} title="体重の推移">
            <LineChart color={category.color} dark={dark} points={weightPoints} unit="kg" />
            {weightPoints.length ? <Text style={[styles.summary, { color: palette.muted }]}>{formatDifference(weightPoints[0].y, weightPoints[weightPoints.length - 1].y, 'kg')}</Text> : null}
          </HistoryCard>
          <HistoryCard palette={palette} title="体脂肪率の推移">
            <LineChart color={category.color} dark={dark} points={fatPoints} unit="%" />
            {fatPoints.length ? <Text style={[styles.summary, { color: palette.muted }]}>{formatDifference(fatPoints[0].y, fatPoints[fatPoints.length - 1].y, '%')}</Text> : null}
          </HistoryCard>
        </> : <HistoryCard palette={palette} title="レベルアップの軌跡">
          <LineChart color={category.color} dark={dark} markers={trajectory.levelUps.map((levelUp) => ({ x: levelUp.x, label: `Lv.${levelUp.level}` }))} points={trajectory.points} unit="XP" />
          {lineage && trajectory.levelUps.length ? <View style={[styles.levelList, { borderTopColor: palette.border }]}>{trajectory.levelUps.slice(-10).reverse().map((levelUp) => { const stage = stageForLevel(lineage, levelUp.level); return <View key={`${levelUp.x}-${levelUp.level}`} style={styles.levelRow}><Text style={[styles.levelDate, { color: palette.muted }]}>{levelUp.x}</Text><Text style={[styles.levelText, { color: palette.text }]}>{stage.emoji} Lv.{levelUp.level} {stage.name}</Text></View>; })}</View> : null}
        </HistoryCard>}
        <HistoryCard palette={palette} title="活動履歴">
          <BarChart bars={activityPoints} color={category.color} dark={dark} />
          <Text style={[styles.summary, { color: palette.muted }]}>合計 {periodDates.length} 回 / 連続 {currentStreak(completionDates, today)} 日</Text>
        </HistoryCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryCard({ children, palette, title }: { children: React.ReactNode; palette: ReturnType<typeof getPalette>; title: string }) {
  return <View style={[styles.card, cardSurface(palette), shadow]}><Text style={[styles.cardTitle, { color: palette.text }]}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  back: { marginRight: 12, padding: 4 },
  card: { borderRadius: radius.card, marginBottom: 16, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  content: { padding: 18, paddingBottom: 30 },
  dot: { borderRadius: 7, height: 14, marginRight: 10, width: 14 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, paddingTop: 15 },
  levelDate: { fontSize: 12, width: 92 },
  levelList: { borderTopWidth: 1, marginTop: 5, paddingTop: 8 },
  levelRow: { flexDirection: 'row', paddingVertical: 5 },
  levelText: { fontSize: 13, fontWeight: '700' },
  period: { alignItems: 'center', borderRadius: radius.control, flex: 1, paddingVertical: 10 },
  periods: { backgroundColor: 'transparent', flexDirection: 'row', gap: 8, marginBottom: 16 },
  safe: { flex: 1 },
  summary: { fontSize: 12, marginTop: 5 },
  title: { flex: 1, fontSize: 22, fontWeight: '800' },
});
