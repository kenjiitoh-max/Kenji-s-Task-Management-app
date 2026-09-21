import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Quote } from '../quotes/quotes';
import { getPalette, radius } from '../theme';

const GOLD = '#E2C069';
const GOLD_DEEP = '#B8892B';

export function QuoteCard({ quote, dark, favorite, onPress, onToggleFavorite }: {
  quote: Quote;
  dark: boolean;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow]);
  const haloStyle = useAnimatedStyle(() => ({ shadowOpacity: 0.45 + glow.value * 0.45, shadowRadius: 14 + glow.value * 12 }));
  const cardStyle = useAnimatedStyle(() => ({ borderColor: interpolateColor(glow.value, [0, 1], [GOLD_DEEP, GOLD]) }));

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <Animated.View pointerEvents="none" style={[styles.halo, haloStyle]} />
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.ornament}>✦</Text>
            <Text style={styles.kicker}>賢者からの金言</Text>
            <Text style={styles.ornament}>✦</Text>
          </View>
          <Pressable accessibilityLabel={favorite ? 'お気に入りから削除' : 'お気に入りに追加'} onPress={onToggleFavorite} style={styles.heart}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? GOLD : '#B4A6CA'} />
          </Pressable>
        </View>
        <View style={styles.rule} />
        <Text style={styles.openQuote}>“</Text>
        <Text style={styles.text}>{quote.textJa}</Text>
        <Text style={styles.author}>— {quote.authorJa}</Text>
        <Text numberOfLines={2} style={[styles.story, { color: dark ? '#B4A6CA' : '#C9BBDD' }]}>{quote.story}</Text>
        <Text style={[styles.corner, styles.cornerTl]}>❧</Text>
        <Text style={[styles.corner, styles.cornerBr]}>❧</Text>
      </Animated.View>
      <Text style={[styles.hint, { color: palette.muted }]}>タップで賢者の物語を読む</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  author: { color: GOLD, fontSize: 14, fontWeight: '700', letterSpacing: 0.5, marginTop: 12, textAlign: 'right' },
  card: {
    backgroundColor: '#1E1330',
    borderColor: GOLD_DEEP,
    borderRadius: radius.card,
    borderWidth: 1.5,
    elevation: 10,
    overflow: 'hidden',
    padding: 20,
  },
  corner: { color: GOLD_DEEP, fontSize: 22, opacity: 0.7, position: 'absolute' },
  cornerBr: { bottom: 6, right: 10, transform: [{ rotate: '180deg' }] },
  cornerTl: { left: 10, top: 6 },
  halo: { backgroundColor: GOLD, borderRadius: radius.card, bottom: 22, left: 0, position: 'absolute', right: 0, shadowColor: GOLD, shadowOffset: { height: 0, width: 0 }, top: 0 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heart: { padding: 5 },
  hint: { fontSize: 11, marginTop: 6, textAlign: 'center' },
  kicker: { color: GOLD, fontSize: 15, fontWeight: '900', letterSpacing: 2 },
  openQuote: { color: GOLD, fontSize: 44, fontWeight: '900', lineHeight: 44, marginBottom: -22, marginTop: 8, opacity: 0.85 },
  ornament: { color: GOLD, fontSize: 12 },
  rule: { backgroundColor: GOLD_DEEP, height: 1, marginTop: 10, opacity: 0.6 },
  story: { fontSize: 12, lineHeight: 18, marginTop: 14 },
  text: { color: '#F6F0FB', fontSize: 20, fontWeight: '700', lineHeight: 32, marginTop: 6 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  wrap: { marginBottom: 16 },
});
