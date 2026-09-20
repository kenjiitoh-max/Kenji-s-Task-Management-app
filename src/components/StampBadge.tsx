import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { CategoryKind } from '../db/types';
import { StampTier, stampTier } from '../growth/stamps';

const tierColors: Record<StampTier, { light: string; mid: string; dark: string; rim: string }> = {
  bronze: { light: '#F9D9B8', mid: '#C67C3A', dark: '#6B3A10', rim: '#8E5321' },
  silver: { light: '#FFFFFF', mid: '#C3C9D3', dark: '#5F6873', rim: '#8A929E' },
  gold: { light: '#FFF6C2', mid: '#E9B92E', dark: '#8A5A00', rim: '#B8860B' },
  diamond: { light: '#F0FDFF', mid: '#7DD3FC', dark: '#1E40AF', rim: '#38BDF8' },
};

const kindEmoji: Record<CategoryKind, string> = { athlete: '🏋️', reader: '📖', bird: '🐦', engineer: '💻', weight: '⚖️' };

export function stampEmoji(kind: CategoryKind | null): string {
  return kind ? kindEmoji[kind] : '⭐';
}

export function StampBadge({ size = 44, kind, streak, stamped, accent, pulseKey = 0, muted }: {
  size?: number;
  kind: CategoryKind | null;
  streak: number;
  stamped: boolean;
  accent: string;
  pulseKey?: number;
  muted: string;
}) {
  const tier = stampTier(streak);
  const colors = tierColors[tier];
  const flip = useSharedValue(0);
  const scale = useSharedValue(1);
  const drop = useSharedValue(0);
  useEffect(() => {
    if (pulseKey > 0) {
      flip.value = 0;
      flip.value = withTiming(360, { duration: 650 });
      scale.value = withSequence(withTiming(1.6, { duration: 250 }), withDelay(250, withSpring(1, { damping: 9, stiffness: 220 })));
      drop.value = withSequence(withTiming(-size * 0.5, { duration: 250 }), withDelay(200, withSpring(0, { damping: 8, stiffness: 260 })));
    }
  }, [pulseKey, flip, scale, drop, size]);
  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 400 }, { translateY: drop.value }, { rotateY: `${flip.value}deg` }, { scale: scale.value }],
  }));
  if (!stamped) {
    return (
      <View style={{ height: size, width: size }}>
        <Svg height={size} viewBox="0 0 100 100" width={size}>
          <Circle cx="50" cy="50" fill="transparent" r="42" stroke={`${accent}66`} strokeDasharray="6 6" strokeWidth="3" />
        </Svg>
        <View style={styles.center}><Text style={{ color: muted, fontSize: size * 0.34, opacity: 0.35 }}>{stampEmoji(kind)}</Text></View>
      </View>
    );
  }
  const fire = streak >= 7;
  const crown = streak >= 30;
  return (
    <Animated.View style={[{ height: size, width: size }, coinStyle]}>
      <Svg height={size} viewBox="0 0 100 100" width={size}>
        <Defs>
          <LinearGradient id="rim" x1="0" x2="1" y1="0" y2="1">
            <Stop offset="0" stopColor={colors.light} />
            <Stop offset="0.45" stopColor={colors.rim} />
            <Stop offset="1" stopColor={colors.dark} />
          </LinearGradient>
          <RadialGradient cx="0.35" cy="0.3" id="face" r="0.8">
            <Stop offset="0" stopColor={colors.light} />
            <Stop offset="0.55" stopColor={colors.mid} />
            <Stop offset="1" stopColor={colors.dark} />
          </RadialGradient>
          <LinearGradient id="fire" x1="0" x2="0" y1="1" y2="0">
            <Stop offset="0" stopColor="#F97316" />
            <Stop offset="1" stopColor="#FDE047" />
          </LinearGradient>
        </Defs>
        <Ellipse cx="50" cy="56" fill="#000" opacity="0.22" rx="42" ry="40" />
        {fire ? <Circle cx="50" cy="50" fill="transparent" opacity="0.9" r="47" stroke="url(#fire)" strokeDasharray="5 3" strokeWidth="4" /> : null}
        <Circle cx="50" cy="50" fill="url(#rim)" r="44" />
        <Circle cx="50" cy="50" fill="url(#face)" r="36" />
        <Circle cx="50" cy="50" fill="transparent" opacity="0.5" r="40" stroke={colors.dark} strokeWidth="1.5" />
        <Circle cx="50" cy="50" fill="transparent" opacity="0.6" r="33" stroke={colors.light} strokeWidth="1" />
        <Path d="M22 34 Q34 18 56 20 Q44 24 30 40 Z" fill="#fff" opacity="0.55" />
        {tier === 'diamond' ? <Path d="M50 14 L55 22 L50 30 L45 22 Z" fill="#fff" opacity="0.8" /> : null}
      </Svg>
      <View style={styles.center}><Text style={{ fontSize: size * 0.4 }}>{stampEmoji(kind)}</Text></View>
      {crown ? <Text style={[styles.crown, { fontSize: size * 0.32, top: -size * 0.22 }]}>👑</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 },
  crown: { alignSelf: 'center', position: 'absolute' },
});
