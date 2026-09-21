import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BodyRecord, BodyProfile } from '../db/types';
import { getBodyStatus, nextFatStep } from '../body/bodyMetrics';
import { cardSurface, getPalette, radius, shadow, textOn } from '../theme';

export function BodyStatusCard({ dark, accent, latest, profile, records, onRecord, onEditProfile, onImportHealth, importing }: {
  dark: boolean;
  accent: string;
  latest: BodyRecord | null;
  profile: BodyProfile;
  records?: BodyRecord[];
  onRecord: () => void;
  onEditProfile: () => void;
  onImportHealth?: () => void;
  importing?: boolean;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const history = [...(records || [])].reverse().slice(-7);
  const min = Math.min(...history.map((record) => record.weight_kg));
  const max = Math.max(...history.map((record) => record.weight_kg));
  const status = latest && profile.height_cm ? getBodyStatus(latest.weight_kg, latest.body_fat_pct, profile.height_cm, profile.sex) : null;
  return (
    <View style={[styles.card, cardSurface(palette), shadow]}>
      {!profile.height_cm ? <View style={styles.empty}><Text style={styles.emptyEmoji}>📏</Text><Text style={[styles.emptyTitle, { color: palette.text }]}>身長を設定するとBMIとステージが表示されます</Text><ProfileButton palette={palette} onPress={onEditProfile} /></View> : !latest ? <View style={styles.empty}><Text style={styles.emptyEmoji}>⚖️</Text><Text style={[styles.emptyTitle, { color: palette.text }]}>最初の体重を記録しましょう</Text><Pressable onPress={onRecord} style={[styles.primaryButton, { backgroundColor: accent }]}><Text style={[styles.primaryText, { color: textOn(accent) }]}>今日の体重を記録</Text></Pressable>{onImportHealth ? <Pressable disabled={importing} onPress={onImportHealth} style={[styles.healthButton, { backgroundColor: `${accent}18`, opacity: importing ? 0.6 : 1 }]}><Text style={[styles.healthText, { color: accent }]}>{importing ? '取り込み中…' : '♥ ヘルスケアから取り込む'}</Text></Pressable> : null}</View> : status ? (
        <>
          <View style={styles.top}><View style={[styles.statusCircle, { backgroundColor: `${status.bmiStage.color}66` }]}><Text style={styles.statusEmoji}>{status.bmiStage.emoji}</Text></View><View style={styles.summary}><Text style={[styles.weight, { color: palette.text }]}>現在 {latest.weight_kg.toFixed(1)} kg</Text>{latest.body_fat_pct != null ? <Text style={[styles.fat, { color: palette.muted }]}>体脂肪 {latest.body_fat_pct.toFixed(1)}%</Text> : null}<View style={styles.chips}><Text style={[styles.chip, { backgroundColor: `${status.bmiStage.color}66`, color: palette.text }]}>BMI {status.bmi.toFixed(1)} · {status.bmiStage.label}</Text>{status.fatStage ? <Text style={[styles.chip, { backgroundColor: `${status.fatStage.color}66`, color: palette.text }]}>体脂肪 {status.fatStage.label}</Text> : null}</View></View></View>
          <Text style={[styles.description, { color: palette.muted }]}>{status.bmiStage.description}</Text>
          {status.next ? <View style={[styles.nextBox, { backgroundColor: `${accent}18` }]}><Text style={[styles.caption, { color: accent }]}>次のステージ</Text><Text style={[styles.nextMessage, { color: palette.text }]}>{status.next.message}</Text></View> : null}
          {latest.body_fat_pct != null && nextFatStep(latest.weight_kg, latest.body_fat_pct, profile.sex) ? <Text style={[styles.fatNext, { color: palette.muted }]}>{nextFatStep(latest.weight_kg, latest.body_fat_pct, profile.sex)}</Text> : null}
          <View style={styles.buttons}><Pressable onPress={onRecord} style={[styles.primaryButton, { backgroundColor: accent }]}><Text style={[styles.primaryText, { color: textOn(accent) }]}>今日の体重を記録</Text></Pressable><Pressable onPress={onEditProfile} style={styles.edit}><Text style={[styles.editText, { color: palette.muted }]}>⚙ 身長・性別</Text></Pressable>{onImportHealth ? <Pressable disabled={importing} onPress={onImportHealth} style={[styles.healthButton, { backgroundColor: `${accent}18`, opacity: importing ? 0.6 : 1 }]}><Text style={[styles.healthText, { color: accent }]}>{importing ? '取り込み中…' : '♥ ヘルスケアから取り込む'}</Text></Pressable> : null}</View>
        </>
      ) : null}
      {history.length ? <View style={[styles.history, { borderTopColor: palette.border }]}>{history.map((record, index) => { const previous = history[index - 1]; const delta = previous ? record.weight_kg - previous.weight_kg : 0; const height = max === min ? 50 : 24 + ((record.weight_kg - min) / (max - min)) * 36; return <View key={record.id} style={styles.historyItem}><View style={styles.barArea}><View style={[styles.bar, { backgroundColor: accent, height }]} /></View><Text style={[styles.date, { color: palette.muted }]}>{record.date.slice(5).replace('-', '/')}</Text>{index > 0 ? <Text style={[styles.delta, { color: delta <= 0 ? '#6DAA7B' : palette.muted }]}>{delta <= 0 ? '▼' : '▲'}{Math.abs(delta).toFixed(1)}kg</Text> : null}</View>; })}</View> : null}
    </View>
  );
}

function ProfileButton({ palette, onPress }: { palette: ReturnType<typeof getPalette>; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.profileButton, { backgroundColor: palette.input }]}><Text style={{ color: palette.text, fontWeight: '700' }}>身長・性別を設定</Text></Pressable>;
}

const styles = StyleSheet.create({
  bar: { borderRadius: 4, minHeight: 4, width: 10 },
  barArea: { alignItems: 'center', height: 60, justifyContent: 'flex-end' },
  buttons: { alignItems: 'center', flexDirection: 'row', marginTop: 17 },
  caption: { fontSize: 12, fontWeight: '800', marginBottom: 4 },
  card: { borderRadius: radius.card, marginBottom: 26, padding: 18 },
  chip: { borderRadius: 20, fontSize: 11, marginRight: 5, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 9 },
  date: { fontSize: 10, marginTop: 4 },
  delta: { fontSize: 10, marginTop: 2 },
  description: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  edit: { paddingHorizontal: 10, paddingVertical: 10 },
  editText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 8 },
  emptyEmoji: { fontSize: 46, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  fat: { fontSize: 14, marginTop: 3 },
  fatNext: { fontSize: 12, lineHeight: 18, marginTop: 10 },
  history: { borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingTop: 12 },
  healthButton: { borderRadius: radius.control, marginLeft: 8, paddingHorizontal: 12, paddingVertical: 10 },
  healthText: { fontSize: 12, fontWeight: '700' },
  historyItem: { alignItems: 'center', flex: 1 },
  nextBox: { borderRadius: radius.control, padding: 12 },
  nextMessage: { fontSize: 13, lineHeight: 19 },
  primaryButton: { alignItems: 'center', borderRadius: radius.control, paddingHorizontal: 14, paddingVertical: 12 },
  primaryText: { fontSize: 13, fontWeight: '700' },
  profileButton: { borderRadius: radius.control, paddingHorizontal: 15, paddingVertical: 12 },
  statusCircle: { alignItems: 'center', borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  statusEmoji: { fontSize: 52 },
  summary: { flex: 1, marginLeft: 15 },
  top: { alignItems: 'center', flexDirection: 'row', marginBottom: 14 },
  weight: { fontSize: 20, fontWeight: '800' },
});
