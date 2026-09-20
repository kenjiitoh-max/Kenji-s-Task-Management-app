import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '../db/types';
import { getPalette } from '../theme';

export function CategoryCard({
  category,
  progress,
  dark,
  onPress,
}: {
  category: Category;
  progress: { total: number; completed: number };
  dark: boolean;
  onPress: () => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const ratio = progress.total ? progress.completed / progress.total : 0;
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: palette.card }]}>
      <View style={[styles.accent, { backgroundColor: category.color }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: palette.text }]}>{category.name}</Text>
          <Ionicons name="chevron-forward" size={20} color={palette.muted} />
        </View>
        <Text style={[styles.progressText, { color: palette.muted }]}>
          {progress.completed}/{progress.total} 完了
        </Text>
        <View style={[styles.track, { backgroundColor: `${category.color}22` }]}>
          <View style={[styles.fill, { backgroundColor: category.color, width: `${ratio * 100}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 14,
    overflow: 'hidden',
  },
  accent: { width: 7 },
  content: { flex: 1, padding: 18 },
  fill: { borderRadius: 3, height: 6 },
  name: { fontSize: 18, fontWeight: '700' },
  progressText: { fontSize: 13, marginBottom: 9, marginTop: 12 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  track: { borderRadius: 3, height: 6, overflow: 'hidden' },
});
