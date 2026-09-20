import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Goal, GoalTerm } from '../db/types';
import { getPalette } from '../theme';

const labels: Record<GoalTerm, string> = { short: '短期', medium: '中期', long: '長期' };

export function GoalCard({
  term,
  goal,
  dark,
  onPress,
}: {
  term: GoalTerm;
  goal?: Goal;
  dark: boolean;
  onPress: () => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.header}>
        <Text style={[styles.term, { color: palette.text }]}>{labels[term]}</Text>
        <Ionicons name="create-outline" size={18} color={palette.muted} />
      </View>
      <Text numberOfLines={2} style={[styles.description, { color: goal ? palette.text : palette.muted }]}>
        {goal?.description || 'タップして設定'}
      </Text>
      {goal?.target_date ? <Text style={[styles.date, { color: palette.muted }]}>{goal.target_date}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 116, padding: 14 },
  date: { fontSize: 12, marginTop: 8 },
  description: { fontSize: 14, lineHeight: 20, marginTop: 16 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  term: { fontSize: 15, fontWeight: '700' },
});
