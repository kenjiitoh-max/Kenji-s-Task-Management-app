import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

type Look = {
  name: string;
  bodyRx: number;
  bodyRy: number;
  headR: number;
  skin: string;
  skinDark: string;
  cheek: string;
  aura: string;
  mouth: 'grin' | 'smile' | 'flat' | 'tired' | 'puff';
  eyes: 'sparkle' | 'round' | 'sleepy' | 'squint';
  sweat: number;
  headband: boolean;
  muscles: boolean;
  leaf: boolean;
  belt: boolean;
};

const looks: Record<string, Look> = {
  under: { name: 'カゲロウ', bodyRx: 22, bodyRy: 34, headR: 20, skin: '#BFE3FF', skinDark: '#7FB7E8', cheek: '#E8F5FF', aura: '#A5D8FF', mouth: 'smile', eyes: 'round', sweat: 0, headband: false, muscles: false, leaf: true, belt: false },
  normal: { name: 'ブレイズ', bodyRx: 30, bodyRy: 36, headR: 21, skin: '#9EE6A8', skinDark: '#4FB56A', cheek: '#FFD1DC', aura: '#B2F2BB', mouth: 'grin', eyes: 'sparkle', sweat: 0, headband: true, muscles: true, leaf: false, belt: true },
  obese1: { name: 'ポムポム', bodyRx: 38, bodyRy: 36, headR: 22, skin: '#FFE59E', skinDark: '#E0B441', cheek: '#FFC2A3', aura: '#FFE08A', mouth: 'flat', eyes: 'round', sweat: 1, headband: false, muscles: false, leaf: false, belt: true },
  obese2: { name: 'モチモチ', bodyRx: 46, bodyRy: 38, headR: 23, skin: '#FFD3B5', skinDark: '#E59A67', cheek: '#FFB0A0', aura: '#FFC9A8', mouth: 'tired', eyes: 'sleepy', sweat: 2, headband: false, muscles: false, leaf: false, belt: false },
  obese3: { name: 'ドテドテ', bodyRx: 54, bodyRy: 40, headR: 24, skin: '#FFC2C2', skinDark: '#E57C7C', cheek: '#FF9C9C', aura: '#FFB3B3', mouth: 'puff', eyes: 'squint', sweat: 3, headband: false, muscles: false, leaf: false, belt: false },
};

export function bodyAvatarName(stageKey: string): string {
  return (looks[stageKey] ?? looks.obese1).name;
}

const W = 140;
const H = 150;
const CX = W / 2;

function Mouth({ look, y }: { look: Look; y: number }) {
  const stroke = '#3B2166';
  switch (look.mouth) {
    case 'grin':
      return <Path d={`M${CX - 9} ${y} Q${CX} ${y + 12} ${CX + 9} ${y}`} fill="#FFFFFF" stroke={stroke} strokeWidth={2} />;
    case 'smile':
      return <Path d={`M${CX - 6} ${y} Q${CX} ${y + 6} ${CX + 6} ${y}`} fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2} />;
    case 'flat':
      return <Line stroke={stroke} strokeLinecap="round" strokeWidth={2} x1={CX - 6} x2={CX + 6} y1={y + 2} y2={y + 2} />;
    case 'tired':
      return <Path d={`M${CX - 7} ${y + 4} Q${CX} ${y - 2} ${CX + 7} ${y + 4}`} fill="none" stroke={stroke} strokeLinecap="round" strokeWidth={2} />;
    default:
      return <Ellipse cx={CX} cy={y + 3} fill={stroke} rx={4} ry={3} />;
  }
}

function Eyes({ look, y }: { look: Look; y: number }) {
  const ink = '#3B2166';
  const dx = 8;
  if (look.eyes === 'sleepy') {
    return (
      <G>
        <Path d={`M${CX - dx - 4} ${y} Q${CX - dx} ${y + 4} ${CX - dx + 4} ${y}`} fill="none" stroke={ink} strokeLinecap="round" strokeWidth={2.2} />
        <Path d={`M${CX + dx - 4} ${y} Q${CX + dx} ${y + 4} ${CX + dx + 4} ${y}`} fill="none" stroke={ink} strokeLinecap="round" strokeWidth={2.2} />
      </G>
    );
  }
  if (look.eyes === 'squint') {
    return (
      <G>
        <Line stroke={ink} strokeLinecap="round" strokeWidth={2.4} x1={CX - dx - 4} x2={CX - dx + 4} y1={y + 1} y2={y - 1} />
        <Line stroke={ink} strokeLinecap="round" strokeWidth={2.4} x1={CX + dx - 4} x2={CX + dx + 4} y1={y - 1} y2={y + 1} />
      </G>
    );
  }
  return (
    <G>
      <Circle cx={CX - dx} cy={y} fill={ink} r={3.2} />
      <Circle cx={CX + dx} cy={y} fill={ink} r={3.2} />
      <Circle cx={CX - dx + 1.2} cy={y - 1.2} fill="#FFFFFF" r={1.1} />
      <Circle cx={CX + dx + 1.2} cy={y - 1.2} fill="#FFFFFF" r={1.1} />
      {look.eyes === 'sparkle' ? <><Path d={`M${CX - dx - 9} ${y - 9} l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5z`} fill="#FFFFFF" /><Path d={`M${CX + dx + 9} ${y - 11} l1.2 2.4 2.4 1.2 -2.4 1.2 -1.2 2.4 -1.2 -2.4 -2.4 -1.2 2.4 -1.2z`} fill="#FFFFFF" /></> : null}
    </G>
  );
}

function Figure({ look }: { look: Look }) {
  const bodyCy = H - 18 - look.bodyRy;
  const headCy = bodyCy - look.bodyRy - look.headR + 10;
  const armY = bodyCy - look.bodyRy * 0.35;
  const outline = '#3B2166';
  const gradientId = `skin-${look.name}`;
  const skinFill = `url(#${gradientId})`;
  return (
    <Svg height="100%" viewBox={`0 0 ${W} ${H}`} width="100%">
      <Defs>
        <RadialGradient cx="0.5" cy="0.35" id={gradientId} r="0.75">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="0.35" stopColor={look.skin} />
          <Stop offset="1" stopColor={look.skinDark} />
        </RadialGradient>
      </Defs>
      {look.muscles ? (
        <G>
          <Ellipse cx={CX - look.bodyRx - 8} cy={armY - 6} fill={skinFill} rx={11} ry={9} stroke={outline} strokeWidth={2} transform={`rotate(-30 ${CX - look.bodyRx - 8} ${armY - 6})`} />
          <Ellipse cx={CX + look.bodyRx + 8} cy={armY - 6} fill={skinFill} rx={11} ry={9} stroke={outline} strokeWidth={2} transform={`rotate(30 ${CX + look.bodyRx + 8} ${armY - 6})`} />
          <Circle cx={CX - look.bodyRx - 14} cy={armY - 16} fill={skinFill} r={6} stroke={outline} strokeWidth={2} />
          <Circle cx={CX + look.bodyRx + 14} cy={armY - 16} fill={skinFill} r={6} stroke={outline} strokeWidth={2} />
        </G>
      ) : (
        <G>
          <Ellipse cx={CX - look.bodyRx - 2} cy={armY + 10} fill={skinFill} rx={7} ry={13} stroke={outline} strokeWidth={2} transform={`rotate(20 ${CX - look.bodyRx - 2} ${armY + 10})`} />
          <Ellipse cx={CX + look.bodyRx + 2} cy={armY + 10} fill={skinFill} rx={7} ry={13} stroke={outline} strokeWidth={2} transform={`rotate(-20 ${CX + look.bodyRx + 2} ${armY + 10})`} />
        </G>
      )}
      <Ellipse cx={CX - look.bodyRx * 0.45} cy={H - 14} fill={skinFill} rx={11} ry={7} stroke={outline} strokeWidth={2} />
      <Ellipse cx={CX + look.bodyRx * 0.45} cy={H - 14} fill={skinFill} rx={11} ry={7} stroke={outline} strokeWidth={2} />
      <Ellipse cx={CX} cy={bodyCy} fill={skinFill} rx={look.bodyRx} ry={look.bodyRy} stroke={outline} strokeWidth={2.4} />
      {look.bodyRx >= 38 ? <Path d={`M${CX - look.bodyRx * 0.55} ${bodyCy + 6} Q${CX} ${bodyCy + 18} ${CX + look.bodyRx * 0.55} ${bodyCy + 6}`} fill="none" stroke={outline} strokeOpacity={0.35} strokeWidth={2} /> : null}
      {look.muscles ? <G stroke={outline} strokeOpacity={0.45} strokeWidth={1.8}><Line x1={CX} x2={CX} y1={bodyCy - 4} y2={bodyCy + 22} /><Line x1={CX - 12} x2={CX + 12} y1={bodyCy + 2} y2={bodyCy + 2} /><Line x1={CX - 11} x2={CX + 11} y1={bodyCy + 12} y2={bodyCy + 12} /></G> : null}
      {look.belt ? <Rect fill={outline} height={6} opacity={0.75} rx={3} width={look.bodyRx * 1.6} x={CX - look.bodyRx * 0.8} y={bodyCy + look.bodyRy * 0.55} /> : null}
      <Circle cx={CX} cy={headCy} fill={skinFill} r={look.headR} stroke={outline} strokeWidth={2.4} />
      {look.headband ? <Path d={`M${CX - look.headR + 1} ${headCy - 6} Q${CX} ${headCy - 12} ${CX + look.headR - 1} ${headCy - 6}`} fill="none" stroke="#E2C069" strokeLinecap="round" strokeWidth={5} /> : null}
      {look.leaf ? <Path d={`M${CX} ${headCy - look.headR} q6 -14 16 -10 q-4 12 -16 10z`} fill="#86EFAC" stroke={outline} strokeWidth={1.5} /> : null}
      <Circle cx={CX - 12} cy={headCy + 6} fill={look.cheek} opacity={0.8} r={4} />
      <Circle cx={CX + 12} cy={headCy + 6} fill={look.cheek} opacity={0.8} r={4} />
      <Eyes look={look} y={headCy - 1} />
      <Mouth look={look} y={headCy + 8} />
      {Array.from({ length: look.sweat }, (_, index) => (
        <Path d={`M${CX + look.headR + 2 + index * 7} ${headCy - 10 - index * 6} q4 6 0 9 q-4 -3 0 -9z`} fill="#8EC5FF" key={index} stroke="#3B82F6" strokeWidth={1} />
      ))}
    </Svg>
  );
}

export function BodyAvatar({ stageKey, size = 96, aura = true, seed = 0 }: { stageKey: string; size?: number; aura?: boolean; seed?: number }) {
  const look = looks[stageKey] ?? looks.obese1;
  const bob = useSharedValue(0);
  const breathe = useSharedValue(1);
  const tilt = useSharedValue(0);
  const glow = useSharedValue(0.6);
  useEffect(() => {
    const delay = (seed % 5) * 180;
    bob.value = withDelay(delay, withRepeat(withSequence(withTiming(-size * 0.05, { duration: 1500, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.sin) })), -1));
    breathe.value = withDelay(delay, withRepeat(withSequence(withTiming(1.05, { duration: 1300, easing: Easing.inOut(Easing.quad) }), withTiming(0.97, { duration: 1300, easing: Easing.inOut(Easing.quad) })), -1, true));
    tilt.value = withDelay(delay, withRepeat(withSequence(withTiming(-3, { duration: 1900, easing: Easing.inOut(Easing.sin) }), withTiming(3, { duration: 1900, easing: Easing.inOut(Easing.sin) })), -1, true));
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1600 }), withTiming(0.5, { duration: 1600 })), -1, true);
  }, [bob, breathe, tilt, glow, seed, size]);
  const figureStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }, { rotate: `${tilt.value}deg` }, { scaleY: breathe.value }, { scaleX: 2 - breathe.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.9 + (glow.value - 0.5) * 0.3 }] }));
  const shadowStyle = useAnimatedStyle(() => ({ opacity: 0.45 + bob.value / (size * 0.1), transform: [{ scaleX: 1 + bob.value / (size * 0.5) }] }));
  return (
    <View style={{ height: size, width: size }}>
      {aura ? <Animated.View style={[styles.glow, { backgroundColor: look.aura, borderRadius: size / 2 }, glowStyle]} /> : null}
      <Animated.View style={[styles.shadow, { borderRadius: size, bottom: size * 0.02, height: size * 0.09, left: size * 0.2, width: size * 0.6 }, shadowStyle]} />
      <Animated.View style={[styles.figure, figureStyle]}><Figure look={look} /></Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  glow: { bottom: '8%', left: '8%', opacity: 0.6, position: 'absolute', right: '8%', top: '8%' },
  shadow: { backgroundColor: '#000000', position: 'absolute' },
});
