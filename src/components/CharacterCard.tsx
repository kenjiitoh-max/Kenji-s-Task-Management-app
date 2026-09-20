import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getLevelState, Lineage } from '../growth/levels';
import { getPalette, radius, shadow } from '../theme';

export function CharacterCard({ dark, accent, lineage, completions, pulseKey }: {
  dark: boolean;
  accent: string;
  lineage: Lineage;
  completions: number;
  pulseKey: number;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const state = getLevelState(lineage, completions);
  const scale = useSharedValue(1);
  useEffect(() => {
    if (pulseKey > 0) scale.value = withSequence(withSpring(1.24), withSpring(1));
  }, [pulseKey, scale]);
  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={[styles.card, { backgroundColor: palette.card }, shadow]}>
      <View style={styles.hero}>
        <Animated.View style={[styles.emojiCircle, { backgroundColor: `${accent}33` }, emojiStyle]}><Text style={styles.emoji}>{state.stage.emoji}</Text></Animated.View>
        <View style={styles.heading}><Text style={[styles.level, { color: palette.text }]}>Lv. {state.level}</Text><Text style={[styles.stage, { color: palette.text }]}>{state.stage.name}</Text></View>
      </View>
      <Text style={[styles.flavor, { color: palette.muted }]}>{state.stage.flavor}</Text>
      <View style={[styles.track, { backgroundColor: `${accent}22` }]}><View style={[styles.fill, { backgroundColor: accent, width: `${state.progress * 100}%` }]} /></View>
      <View style={styles.xpRow}><Text style={[styles.xp, { color: palette.muted }]}>{state.xpIntoLevel} / {state.xpForLevel} XP</Text><Text style={[styles.next, { color: palette.muted }]}>{state.nextStage ? `次の進化: ${state.nextStage.emoji} ${state.nextStage.name} (Lv.${state.nextStage.minLevel})` : '最終形態！'}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, marginBottom: 26, padding: 18 },
  emoji: { fontSize: 56 },
  emojiCircle: { alignItems: 'center', borderRadius: 42, height: 84, justifyContent: 'center', width: 84 },
  fill: { borderRadius: 4, height: 8 },
  flavor: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  heading: { marginLeft: 16 },
  hero: { alignItems: 'center', flexDirection: 'row', marginBottom: 14 },
  level: { fontSize: 30, fontWeight: '800' },
  next: { flex: 1, fontSize: 12, textAlign: 'right' },
  stage: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  xp: { fontSize: 12 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
});
