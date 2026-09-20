import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Quote } from '../quotes/quotes';
import { getPalette, radius, shadow } from '../theme';

export function QuoteCard({ quote, dark, favorite, onPress, onToggleFavorite }: {
  quote: Quote;
  dark: boolean;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: dark ? '#3A2B52' : '#F3ECFA' }, shadow]}>
      <View style={styles.header}>
        <Text style={[styles.kicker, { color: palette.muted }]}>今日の言葉</Text>
        <Pressable accessibilityLabel={favorite ? 'お気に入りから削除' : 'お気に入りに追加'} onPress={onToggleFavorite} style={styles.heart}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? palette.gold : palette.muted} />
        </Pressable>
      </View>
      <Text style={[styles.text, { color: palette.text }]}>{quote.textJa}</Text>
      <Text style={[styles.author, { color: palette.muted }]}>— {quote.authorJa}</Text>
      <Text numberOfLines={2} style={[styles.story, { color: palette.muted }]}>{quote.story}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  author: { fontSize: 13, marginTop: 10 },
  card: { borderRadius: radius.card, marginBottom: 22, padding: 18 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heart: { padding: 5 },
  kicker: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  story: { fontSize: 12, lineHeight: 18, marginTop: 14 },
  text: { fontSize: 20, fontWeight: '600', lineHeight: 31, marginTop: 14 },
});
