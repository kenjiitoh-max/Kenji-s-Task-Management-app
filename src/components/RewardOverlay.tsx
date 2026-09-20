import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

export type Reward = { emoji: string; title: string; subtitle: string };

const RAY_COUNT = 12;
const SPARKLES = Array.from({ length: 14 }, (_, index) => ({ angle: (index / 14) * Math.PI * 2, distance: 110 + (index % 3) * 34, size: 10 + (index % 4) * 4 }));

function Sparkle({ angle, distance, size, color }: { angle: number; distance: number; size: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => { progress.value = withDelay(350, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })); }, [progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateX: Math.cos(angle) * distance * progress.value }, { translateY: Math.sin(angle) * distance * progress.value }, { scale: 0.4 + progress.value }],
  }));
  return <Animated.View style={[styles.sparkle, { backgroundColor: color, borderRadius: size / 2, height: size, width: size }, style]} />;
}

export function RewardOverlay({ reward, accent, onDismiss }: { reward: Reward | null; accent: string; onDismiss: () => void }) {
  const backdrop = useSharedValue(0);
  const badge = useSharedValue(0);
  const rays = useSharedValue(0);
  const text = useSharedValue(0);
  const glow = useSharedValue(1);
  const { width, height } = Dimensions.get('window');
  useEffect(() => {
    if (!reward) return;
    backdrop.value = withTiming(1, { duration: 250 });
    badge.value = 0;
    badge.value = withDelay(150, withSpring(1, { damping: 8, stiffness: 140 }));
    rays.value = 0;
    rays.value = withRepeat(withTiming(360, { duration: 9000, easing: Easing.linear }), -1);
    glow.value = withRepeat(withSequence(withTiming(1.12, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
    text.value = 0;
    text.value = withDelay(500, withSpring(1, { damping: 14 }));
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [reward, backdrop, badge, rays, text, glow, onDismiss]);
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));
  const badgeStyle = useAnimatedStyle(() => ({ opacity: badge.value, transform: [{ scale: 0.2 + badge.value * 0.8 * glow.value }, { rotate: `${(1 - badge.value) * -40}deg` }] }));
  const raysStyle = useAnimatedStyle(() => ({ opacity: badge.value * 0.9, transform: [{ rotate: `${rays.value}deg` }, { scale: 0.6 + badge.value * 0.4 }] }));
  const textStyle = useAnimatedStyle(() => ({ opacity: text.value, transform: [{ translateY: (1 - text.value) * 40 }] }));
  if (!reward) return null;
  const raySize = Math.min(width, height) * 0.95;
  return (
    <Pressable accessibilityLabel="演出を閉じる" onPress={onDismiss} style={styles.fill}>
      <Animated.View style={[styles.fill, styles.backdrop, backdropStyle]} />
      <View style={styles.stage}>
        <Animated.View style={[styles.rays, { height: raySize, width: raySize }, raysStyle]}>
          <Svg height={raySize} viewBox="-100 -100 200 200" width={raySize}>
            <Defs>
              <RadialGradient cx="0" cy="0" gradientUnits="userSpaceOnUse" id="rayGlow" r="100">
                <Stop offset="0" stopColor={accent} stopOpacity="0.95" />
                <Stop offset="1" stopColor={accent} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            {Array.from({ length: RAY_COUNT }, (_, index) => {
              const angle = (index / RAY_COUNT) * 360;
              return <Path d="M0 0 L-9 -100 L9 -100 Z" fill="url(#rayGlow)" key={index} transform={`rotate(${angle})`} />;
            })}
          </Svg>
        </Animated.View>
        {SPARKLES.map((sparkle, index) => <Sparkle color={index % 2 === 0 ? '#FDE68A' : '#fff'} key={index} {...sparkle} />)}
        <Animated.View style={[styles.badge, { backgroundColor: accent, shadowColor: accent }, badgeStyle]}>
          <Text style={styles.emoji}>{reward.emoji}</Text>
        </Animated.View>
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.title}>{reward.title}</Text>
          <Text style={styles.subtitle}>{reward.subtitle}</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#0B0620E6' },
  badge: { alignItems: 'center', borderRadius: 80, elevation: 12, height: 160, justifyContent: 'center', shadowOffset: { height: 0, width: 0 }, shadowOpacity: 0.9, shadowRadius: 36, width: 160 },
  emoji: { fontSize: 88 },
  fill: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  rays: { position: 'absolute' },
  sparkle: { position: 'absolute' },
  stage: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  subtitle: { color: '#E5E7EB', fontSize: 16, marginTop: 8, textAlign: 'center' },
  textBlock: { alignItems: 'center', marginTop: 36, paddingHorizontal: 24 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
});
