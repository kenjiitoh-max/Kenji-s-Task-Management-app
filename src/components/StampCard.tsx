import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CategoryKind } from '../db/types';
import { currentStreak } from '../growth/history';
import { earnedMilestones, MILESTONES, nextMilestone, stampDays, streakEndingAt } from '../growth/stamps';
import { cardSurface, getPalette, radius, shadow } from '../theme';
import { StampBadge } from './StampBadge';

export function StampCard({ dark, accent, kind, dates, today, pulseKey }: {
  dark: boolean;
  accent: string;
  kind: CategoryKind | null;
  dates: string[];
  today: string;
  pulseKey: number;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const streak = currentStreak(dates, today);
  const days = stampDays(dates, 14, today);
  const next = nextMilestone(streak);
  const earned = new Set(earnedMilestones(dates).map((milestone) => milestone.days));
  return (
    <View style={[styles.card, cardSurface(palette), shadow]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.text }]}>スタンプ</Text>
        <Text style={[styles.streak, { color: palette.text }]}>{streak > 0 ? `🔥 ${streak}日連続` : '今日から始めよう'}</Text>
      </View>
      <View style={styles.grid}>
        {days.map((day) => (
          <View key={day.date} style={styles.cell}>
            <StampBadge accent={accent} kind={kind} muted={palette.muted} pulseKey={day.isToday ? pulseKey : 0} size={40} stamped={day.stamped} streak={day.stamped ? streakEndingAt(dates, day.date) : 0} />
            <Text style={[styles.dayNumber, { color: palette.muted }]}>{day.date.slice(8)}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.track, { backgroundColor: `${accent}22` }]}>
        <View style={[styles.fill, { backgroundColor: accent, width: next ? `${Math.min(1, streak / next.days) * 100}%` : '100%' }]} />
      </View>
      <Text style={[styles.nextText, { color: palette.muted }]}>
        {next ? `次の褒美 ${next.emoji} ${next.title} まであと ${next.days - streak}日` : '全ての褒美を獲得！'}
      </Text>
      <View style={styles.badges}>
        {MILESTONES.map((milestone) => {
          const isEarned = earned.has(milestone.days);
          return (
            <View
              accessibilityLabel={`${milestone.title} ${isEarned ? '獲得' : '未獲得'}`}
              key={milestone.days}
              style={[styles.badge, { backgroundColor: `${accent}22`, opacity: isEarned ? 1 : 0.3 }]}
            >
              <Text style={styles.badgeEmoji}>{isEarned ? milestone.emoji : '🔒'}</Text>
              <Text style={[styles.badgeDays, { color: palette.muted }]}>{milestone.days}日</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6 },
  badgeDays: { fontSize: 10, marginTop: 2 },
  badgeEmoji: { fontSize: 20 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  card: { borderRadius: radius.card, marginBottom: 26, padding: 18 },
  cell: { alignItems: 'center', marginBottom: 8, width: '14.28%' },
  dayNumber: { fontSize: 10, marginTop: 4 },
  fill: { borderRadius: 4, height: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  nextText: { fontSize: 12, marginTop: 9 },
  streak: { fontSize: 14, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '800' },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
});
