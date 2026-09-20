import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 220, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(visible ? 0 : 10, { duration: 220 });
  }, [opacity, translateY, visible]);
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  return <Animated.View pointerEvents="none" style={[styles.toast, animatedStyle]}><Text style={styles.text}>{message}</Text></Animated.View>;
}

const styles = StyleSheet.create({
  text: { color: '#fff', fontSize: 14, fontWeight: '600' },
  toast: { backgroundColor: '#111827', borderRadius: 22, bottom: 36, left: 24, paddingHorizontal: 18, paddingVertical: 12, position: 'absolute', right: 24 },
});
