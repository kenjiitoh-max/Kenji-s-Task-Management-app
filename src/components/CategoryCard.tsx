import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '../db/types';
import { getPalette, radius, shadow } from '../theme';

export function CategoryCard({
  category,
  progress,
  dark,
  onPress,
  subtitle,
  emoji,
  streaks,
}: {
  category: Category;
  progress: { total: number; completed: number };
  dark: boolean;
  onPress: () => void;
  subtitle?: string;
  emoji?: string;
  streaks?: { id: number; title: string; streak: number }[];
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const ratio = progress.total ? progress.completed / progress.total : 0;
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: `${category.color}1A` }, shadow]}>
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.nameRow}>{emoji ? <View style={[styles.emojiCircle, { backgroundColor: `${category.color}33` }]}><Text style={styles.emoji}>{emoji}</Text></View> : null}<Text style={[styles.name, { color: palette.text }]}>{category.name}</Text></View>
          <Ionicons name="chevron-forward" size={20} color={palette.muted} />
        </View>
        {subtitle ? <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text> : null}
        {(() => {
          const active = (streaks ?? []).filter((entry) => entry.streak > 0);
          if (!active.length) return null;
          return (
            <View style={styles.streaks}>
              {active.slice(0, 3).map((entry) => (
                <View key={entry.id} style={[styles.streakChip, { backgroundColor: `${category.color}22` }]}>
                  <Text numberOfLines={1} style={[styles.streakText, { color: palette.text }]}>🔥{entry.streak}日 {entry.title}</Text>
                </View>
              ))}
              {active.length > 3 ? <View style={[styles.streakChip, { backgroundColor: `${category.color}22` }]}><Text style={[styles.streakText, { color: palette.text }]}>+{active.length - 3}</Text></View> : null}
            </View>
          );
        })()}
        <Text style={[styles.progressText, { color: palette.muted }]}>{progress.completed}/{progress.total} 完了</Text>
        <View style={[styles.track, { backgroundColor: `${category.color}22` }]}>
          <View style={[styles.fill, { backgroundColor: category.color, width: `${ratio * 100}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, marginBottom: 14, overflow: 'hidden' },
  content: { flex: 1, padding: 18 },
  emoji: { fontSize: 22 },
  emojiCircle: { alignItems: 'center', borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 9, width: 36 },
  fill: { borderRadius: 3, height: 6 },
  name: { fontSize: 18, fontWeight: '700' },
  progressText: { fontSize: 13, marginBottom: 9, marginTop: 8 },
  nameRow: { alignItems: 'center', flexDirection: 'row', flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  streakChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  streakText: { fontSize: 12 },
  streaks: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  subtitle: { fontSize: 13, marginTop: 8 },
  track: { borderRadius: 3, height: 6, overflow: 'hidden' },
});
