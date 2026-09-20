import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import { getLevelState, Lineage, lineages } from '../growth/levels';
import { radius, shadow } from '../theme';

const HERO = 300;
const PARTICLES = Array.from({ length: 9 }, (_, index) => ({ x: 24 + ((index * 37) % 240), delay: index * 260, size: 5 + (index % 3) * 3 }));

const auraByStageIndex = ['#9CA3AF', '#86EFAC', '#60A5FA', '#A78BFA', '#F472B6', '#FBBF24', '#F97316'];

function Particle({ x, delay, size, color }: { x: number; delay: number; size: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2600 + delay, easing: Easing.out(Easing.quad) }), -1));
  }, [progress, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.15 ? progress.value / 0.15 : 1 - progress.value,
    transform: [{ translateY: HERO * 0.72 - progress.value * HERO * 0.6 }, { translateX: Math.sin(progress.value * 6) * 8 }],
  }));
  return <Animated.View style={[styles.particle, { backgroundColor: color, borderRadius: size / 2, height: size, left: x, width: size }, style]} />;
}

export function CharacterCard({ dark, lineage, completions, pulseKey }: {
  dark: boolean;
  accent: string;
  lineage: Lineage;
  completions: number;
  pulseKey: number;
}) {
  const state = getLevelState(lineage, completions);
  const stageIndex = lineages[lineage].indexOf(state.stage);
  const aura = auraByStageIndex[Math.min(stageIndex, auraByStageIndex.length - 1)];
  const levelsToNext = state.nextStage ? state.nextStage.minLevel - state.level : 0;
  const closeness = state.nextStage ? Math.max(0, Math.min(1, 1 - (levelsToNext - state.progress) / (state.nextStage.minLevel - state.stage.minLevel))) : 1;
  const float = useSharedValue(0);
  const pulse = useSharedValue(1);
  const pop = useSharedValue(1);
  const shimmer = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withSequence(withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })), -1);
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 1400 }), withTiming(0.96, { duration: 1400 })), -1, true);
    shimmer.value = withRepeat(withTiming(360, { duration: 14000, easing: Easing.linear }), -1);
  }, [float, pulse, shimmer]);
  useEffect(() => {
    if (pulseKey > 0) pop.value = withSequence(withSpring(1.28, { damping: 6 }), withSpring(1));
  }, [pulseKey, pop]);
  const charStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value }, { scale: pop.value }] }));
  const auraStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const shimmerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shimmer.value}deg` }] }));
  const shadowStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: 1 + float.value / 60 }], opacity: 0.35 + float.value / 80 }));
  return (
    <View style={[styles.card, { backgroundColor: dark ? '#1B1230' : '#2A1B4A' }, shadow]}>
      <View style={styles.hero}>
        <Animated.View style={[styles.layer, shimmerStyle]}>
          <Svg height={HERO} viewBox="0 0 300 300" width={HERO}>
            <Defs>
              <RadialGradient cx="0.5" cy="0.5" id="bg" r="0.7">
                <Stop offset="0" stopColor={aura} stopOpacity={0.35 + closeness * 0.35} />
                <Stop offset="1" stopColor={aura} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="150" cy="150" fill="url(#bg)" r="150" />
            {Array.from({ length: 8 }, (_, index) => (
              <Path d="M150 150 L138 0 L162 0 Z" fill={aura} key={index} opacity={0.08 + closeness * 0.1} transform={`rotate(${index * 45} 150 150)`} />
            ))}
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.layer, auraStyle]}>
          <Svg height={HERO} viewBox="0 0 300 300" width={HERO}>
            <Defs>
              <RadialGradient cx="0.5" cy="0.5" id="aura" r="0.5">
                <Stop offset="0.4" stopColor={aura} stopOpacity="0.55" />
                <Stop offset="0.75" stopColor={aura} stopOpacity="0.18" />
                <Stop offset="1" stopColor={aura} stopOpacity="0" />
              </RadialGradient>
              <RadialGradient cx="0.5" cy="0.35" id="pedestal" r="0.7">
                <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
                <Stop offset="1" stopColor={aura} stopOpacity="0.15" />
              </RadialGradient>
            </Defs>
            <Circle cx="150" cy="140" fill="url(#aura)" r="120" />
            <Ellipse cx="150" cy="232" fill="url(#pedestal)" rx="96" ry="26" />
            <Ellipse cx="150" cy="232" fill="transparent" rx="96" ry="26" stroke={aura} strokeOpacity="0.6" strokeWidth="2" />
            <Ellipse cx="150" cy="240" fill={aura} opacity="0.25" rx="104" ry="30" />
          </Svg>
        </Animated.View>
        {PARTICLES.map((particle, index) => <Particle color={index % 3 === 0 ? '#fff' : aura} key={index} {...particle} />)}
        <Animated.View style={[styles.groundShadow, { backgroundColor: '#000' }, shadowStyle]} />
        <Animated.View style={[styles.character, charStyle]}>
          <Text style={styles.emoji}>{state.stage.emoji}</Text>
        </Animated.View>
        {state.nextStage ? (
          <View style={styles.nextBox}>
            <Text style={[styles.nextEmoji, { opacity: 0.25 + closeness * 0.35 }]}>{state.nextStage.emoji}</Text>
            <View style={styles.nextMask}><Text style={styles.nextMark}>?</Text></View>
            <Text style={styles.nextLabel}>次の姿</Text>
          </View>
        ) : null}
        <View style={[styles.levelBadge, { backgroundColor: aura }]}><Text style={styles.levelText}>Lv.{state.level}</Text></View>
      </View>
      <View style={styles.info}>
        <Text style={styles.stage}>{state.stage.name}</Text>
        <Text style={styles.flavor}>{state.stage.flavor}</Text>
        <View style={[styles.track, { backgroundColor: '#FFFFFF22' }]}><View style={[styles.fill, { backgroundColor: aura, width: `${state.progress * 100}%` }]} /></View>
        <View style={styles.xpRow}>
          <Text style={styles.xp}>{state.xpIntoLevel} / {state.xpForLevel} XP</Text>
          <Text style={styles.next}>{state.nextStage ? `進化まで Lv.${state.nextStage.minLevel} (あと${levelsToNext}レベル)` : '最終形態！'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, marginBottom: 26, overflow: 'hidden' },
  character: { alignItems: 'center', justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: HERO * 0.22 },
  emoji: { fontSize: 128, lineHeight: 150, textAlign: 'center' },
  fill: { borderRadius: 4, height: 8 },
  flavor: { color: '#D9CFEA', fontSize: 14, lineHeight: 21, marginBottom: 14, marginTop: 4 },
  groundShadow: { borderRadius: 40, height: 16, left: '50%', marginLeft: -55, position: 'absolute', top: HERO * 0.74, width: 110 },
  hero: { alignItems: 'center', height: HERO, justifyContent: 'center', overflow: 'hidden' },
  info: { padding: 18, paddingTop: 6 },
  layer: { position: 'absolute' },
  levelBadge: { borderRadius: 14, left: 16, paddingHorizontal: 12, paddingVertical: 6, position: 'absolute', top: 16 },
  levelText: { color: '#1F1233', fontSize: 15, fontWeight: '900' },
  next: { color: '#D9CFEA', flex: 1, fontSize: 12, textAlign: 'right' },
  nextBox: { alignItems: 'center', position: 'absolute', right: 14, top: 14 },
  nextEmoji: { fontSize: 34 },
  nextLabel: { color: '#D9CFEA', fontSize: 10, marginTop: 2 },
  nextMark: { color: '#fff', fontSize: 22, fontWeight: '900' },
  nextMask: { alignItems: 'center', backgroundColor: '#0B0620AA', borderRadius: 22, height: 44, justifyContent: 'center', position: 'absolute', top: 0, width: 44 },
  particle: { position: 'absolute', top: 0 },
  stage: { color: '#fff', fontSize: 24, fontWeight: '800' },
  track: { borderRadius: 4, height: 8, overflow: 'hidden' },
  xp: { color: '#D9CFEA', fontSize: 12 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
});
