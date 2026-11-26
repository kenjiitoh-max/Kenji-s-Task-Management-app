import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeSegmentedControl } from '../src/components/ThemeSegmentedControl';
import { useTheme } from '../src/hooks/useTheme';
import { cardSurface, radius, shadow } from '../src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { palette } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="戻る" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>設定</Text>
      </View>
      <View style={[styles.card, cardSurface(palette), shadow]}>
        <Text style={[styles.label, { color: palette.text }]}>テーマ</Text>
        <ThemeSegmentedControl />
      </View>
      <Text style={[styles.hint, { color: palette.muted }]}>システムは端末の外観設定に合わせて自動で切り替わります</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { marginRight: 12, padding: 4 },
  card: { borderRadius: radius.card, marginHorizontal: 20, marginTop: 22, padding: 18 },
  header: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 18, paddingTop: 15 },
  hint: { fontSize: 13, lineHeight: 20, marginHorizontal: 24, marginTop: 14 },
  label: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  safe: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800' },
});
