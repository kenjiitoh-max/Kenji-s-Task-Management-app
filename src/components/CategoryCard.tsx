import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Category } from '../db/types';
import { getPalette, radius, shadow } from '../theme';

function LivingEmoji({ emoji, color, seed }: { emoji: string; color: string; seed: number }) {
  const bob = useSharedValue(0);
  const tilt = useSharedValue(0);
  const squash = useSharedValue(1);
  useEffect(() => {
    const delay = (seed % 5) * 220;
    bob.value = withDelay(delay, withRepeat(withSequence(withTiming(-4, { duration: 1400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })), -1));
    tilt.value = withDelay(delay, withRepeat(withSequence(withTiming(-8, { duration: 1700, easing: Easing.inOut(Easing.sin) }), withTiming(8, { duration: 1700, easing: Easing.inOut(Easing.sin) })), -1, true));
    squash.value = withDelay(delay + 900, withRepeat(withSequence(withTiming(1, { duration: 2600 }), withTiming(1.18, { duration: 160 }), withTiming(0.92, { duration: 160 }), withTiming(1, { duration: 220 })), -1));
  }, [bob, tilt, squash, seed]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }, { rotate: `${tilt.value}deg` }, { scale: squash.value }] }));
  return (
    <View style={[styles.emojiCircle, { backgroundColor: `${color}33` }]}>
      <Animated.Text style={[styles.emoji, style]}>{emoji}</Animated.Text>
    </View>
  );
}

export function CategoryCard({
  category,
  progress,
  dark,
  onPress,
  onLongPress,
  subtitle,
  emoji,
  character,
  streaks,
}: {
  category: Category;
  progress: { total: number; completed: number };
  dark: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  subtitle?: string;
  emoji?: string;
  character?: React.ReactNode;
  streaks?: { id: number; title: string; streak: number }[];
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const ratio = progress.total ? progress.completed / progress.total : 0;
  const accent = palette.gold;
  return (
    <Pressable onLongPress={onLongPress} onPress={onPress} style={[styles.card, { backgroundColor: palette.card, borderColor: accent }, shadow]}>
      <View pointerEvents="none" style={[styles.tint, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          {character ? <View style={[styles.stage, { backgroundColor: `${accent}1A` }]}>{character}</View> : emoji ? <LivingEmoji color={accent} emoji={emoji} seed={category.id} /> : null}
          <View style={styles.titles}>
            <Text style={[styles.name, { color: palette.text }]}>{category.name}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={20} color={accent} />
        </View>
        {(() => {
          const active = (streaks ?? []).filter((entry) => entry.streak > 0);
          if (!active.length) return null;
          return (
            <View style={styles.streaks}>
              {active.slice(0, 3).map((entry) => (
                <View key={entry.id} style={[styles.streakChip, { backgroundColor: `${accent}22` }]}>
                  <Text numberOfLines={1} style={[styles.streakText, { color: palette.text }]}>🔥{entry.streak}日 {entry.title}</Text>
                </View>
              ))}
              {active.length > 3 ? <View style={[styles.streakChip, { backgroundColor: `${accent}22` }]}><Text style={[styles.streakText, { color: palette.text }]}>+{active.length - 3}</Text></View> : null}
            </View>
          );
        })()}
        <Text style={[styles.progressText, { color: palette.muted }]}>{progress.completed}/{progress.total} 完了</Text>
        <View style={[styles.track, { backgroundColor: `${accent}22` }]}>
          <View style={[styles.fill, { backgroundColor: accent, width: `${ratio * 100}%` }]} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  content: { flex: 1, padding: 18 },
  emoji: { fontSize: 22 },
  emojiCircle: { alignItems: 'center', borderRadius: 22, height: 44, justifyContent: 'center', marginRight: 9, width: 44 },
  fill: { borderRadius: 3, height: 6 },
  name: { fontSize: 20, fontWeight: '700' },
  progressText: { fontSize: 13, marginBottom: 9, marginTop: 8 },
  row: { alignItems: 'center', flexDirection: 'row' },
  stage: { alignItems: 'center', borderRadius: 24, height: 104, justifyContent: 'center', marginRight: 14, width: 104 },
  titles: { flex: 1 },
  streakChip: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  streakText: { fontSize: 12 },
  streaks: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  subtitle: { fontSize: 14, marginTop: 6 },
  tint: { bottom: 0, left: 0, opacity: 0.08, position: 'absolute', right: 0, top: 0 },
  track: { borderRadius: 3, height: 6, overflow: 'hidden' },
});
