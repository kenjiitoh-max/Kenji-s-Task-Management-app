import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WorkoutSet } from '../db/types';
import { ExerciseBest } from '../db/workouts';
import { cardSurface, getPalette, radius, shadow, textOn } from '../theme';

export function WorkoutCard({ dark, accent, today, bests, onLog, onDelete }: {
  dark: boolean;
  accent: string;
  today: WorkoutSet[];
  bests: ExerciseBest[];
  onLog: () => void;
  onDelete: (set: WorkoutSet) => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const volume = today.reduce((sum, set) => sum + set.weight_kg * set.reps * set.sets, 0);
  return (
    <View style={[styles.card, shadow, cardSurface(palette)]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>🏋️ 今日のトレ</Text>
        <Pressable accessibilityLabel="種目を記録" onPress={onLog} style={[styles.logButton, { backgroundColor: accent }]}><Text style={[styles.logText, { color: textOn(accent) }]}>＋ 記録</Text></Pressable>
      </View>
      {today.length === 0 ? <Text style={[styles.empty, { color: palette.muted }]}>まだ記録なし。1 種目でも記録すると今日の XP が入る。</Text> : (
        <View>
          {today.map((set) => (
            <Pressable accessibilityLabel={`${set.exercise} を削除`} key={set.id} onLongPress={() => onDelete(set)} style={[styles.row, { borderBottomColor: palette.border }]}>
              <Text style={[styles.exercise, { color: palette.text }]}>{set.exercise}</Text>
              <Text style={[styles.detail, { color: palette.muted }]}>{set.weight_kg > 0 ? `${set.weight_kg}kg × ` : ''}{set.reps}回 × {set.sets}set</Text>
            </Pressable>
          ))}
          <Text style={[styles.volume, { color: palette.muted }]}>総ボリューム {Math.round(volume).toLocaleString()} kg ・ 長押しで削除</Text>
        </View>
      )}
      {bests.length > 0 ? (
        <View style={styles.bests}>
          <Text style={[styles.bestsTitle, { color: palette.text }]}>自己ベスト</Text>
          <View style={styles.bestGrid}>
            {bests.filter((best) => best.weight_kg > 0).slice(0, 6).map((best) => <View key={best.exercise} style={[styles.best, { backgroundColor: palette.input }]}><Text numberOfLines={1} style={[styles.bestName, { color: palette.muted }]}>{best.exercise}</Text><Text style={[styles.bestValue, { color: palette.text }]}>{best.weight_kg}<Text style={styles.bestUnit}>kg</Text></Text></View>)}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  best: { borderRadius: 12, minWidth: 96, padding: 10 },
  bestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bestName: { fontSize: 11, fontWeight: '600' },
  bestUnit: { fontSize: 11, fontWeight: '600' },
  bestValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  bests: { marginTop: 16 },
  bestsTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8 },
  card: { borderRadius: radius.card, marginBottom: 24, padding: 18 },
  detail: { fontSize: 14, fontWeight: '600' },
  empty: { fontSize: 13 },
  exercise: { flex: 1, fontSize: 15, fontWeight: '700' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  logButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  logText: { fontSize: 13, fontWeight: '800' },
  row: { alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 9 },
  title: { fontSize: 18, fontWeight: '800' },
  volume: { fontSize: 12, marginTop: 8 },
});
