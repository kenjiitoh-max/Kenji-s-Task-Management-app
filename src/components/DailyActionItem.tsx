import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DailyAction } from '../db/types';
import { getPalette } from '../theme';

export function DailyActionItem({ action, dark, accent, onToggle, onDelete }: { action: DailyAction; dark: boolean; accent: string; onToggle: () => void; onDelete: () => void }) {
  const scale = useSharedValue(1);
  useEffect(() => { if (action.is_completed) scale.value = withSequence(withSpring(1.3), withSpring(1)); }, [action.is_completed, scale]);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const palette = getPalette(dark ? 'dark' : 'light');
  return (
    <View style={[styles.row, { backgroundColor: palette.card }]}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: action.is_completed }} onPress={onToggle} style={styles.checkPress}>
        <Animated.View style={[styles.checkbox, { borderColor: accent, backgroundColor: action.is_completed ? accent : 'transparent' }, animatedStyle]}>
          {action.is_completed ? <Ionicons name="checkmark" size={17} color="#fff" /> : null}
        </Animated.View>
      </Pressable>
      <Text style={[styles.title, { color: action.is_completed ? palette.muted : palette.text, textDecorationLine: action.is_completed ? 'line-through' : 'none' }]}>{action.title}</Text>
      <Pressable accessibilityLabel="削除" onPress={onDelete} style={styles.delete}><Ionicons name="trash-outline" size={20} color={palette.muted} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: { alignItems: 'center', borderRadius: 12, borderWidth: 2, height: 24, justifyContent: 'center', width: 24 },
  checkPress: { padding: 4 },
  delete: { padding: 6 },
  row: { alignItems: 'center', borderRadius: 14, flexDirection: 'row', marginBottom: 10, paddingHorizontal: 12, paddingVertical: 11 },
  title: { flex: 1, fontSize: 15, marginHorizontal: 9 },
});
