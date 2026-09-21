import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

type Look = {
  name: string;
  /** 肩幅 (中心からの半径) */
  shoulder: number;
  /** 腰幅 (中心からの半径) */
  waist: number;
  headR: number;
  armW: number;
  legW: number;
  suit: string;
  aura: string;
  mouth: 'grin' | 'smile' | 'flat' | 'tired' | 'puff';
  eyes: 'sparkle' | 'round' | 'sleepy' | 'squint';
  sweat: number;
  /** 標準体型: 金のヘッドバンド・ガッツポーズ・腹筋 */
  fit: boolean;
  /** 肥満: お腹のふくらみ */
  belly: boolean;
};

const SKIN = '#F1C9A5';
const SKIN_DARK = '#C48B5F';
const INK = '#3B2166';
const HAIR = '#1F1233';

const looks: Record<string, Look> = {
  under: { name: 'ルーキー', shoulder: 16, waist: 12, headR: 17, armW: 5, legW: 6, suit: '#93C5FD', aura: '#A5D8FF', mouth: 'smile', eyes: 'round', sweat: 0, fit: false, belly: false },
  normal: { name: 'チャンプ', shoulder: 22, waist: 16, headR: 18, armW: 8, legW: 9, suit: '#E2C069', aura: '#B2F2BB', mouth: 'grin', eyes: 'sparkle', sweat: 0, fit: true, belly: false },
  obese1: { name: 'ぽっちゃり', shoulder: 22, waist: 26, headR: 19, armW: 7, legW: 9, suit: '#FCD34D', aura: '#FFE08A', mouth: 'flat', eyes: 'round', sweat: 1, fit: false, belly: true },
  obese2: { name: 'どっしり', shoulder: 24, waist: 34, headR: 20, armW: 8, legW: 10, suit: '#FDBA74', aura: '#FFC9A8', mouth: 'tired', eyes: 'sleepy', sweat: 2, fit: false, belly: true },
  obese3: { name: 'ヘビー級', shoulder: 26, waist: 42, headR: 21, armW: 9, legW: 11, suit: '#FCA5A5', aura: '#FFB3B3', mouth: 'puff', eyes: 'squint', sweat: 3, fit: false, belly: true },
};

export function bodyAvatarName(stageKey: string): string {
  return (looks[stageKey] ?? looks.obese1).name;
}

const W = 140;
const H = 150;
const CX = W / 2;
const HEAD_CY = 42;
const FACE_Y = 44;
const TORSO_TOP = 62;
const TORSO_BOTTOM = 104;

function Mouth({ look, y }: { look: Look; y: number }) {
  switch (look.mouth) {
    case 'grin':
      return <Path d={`M${CX - 8} ${y} Q${CX} ${y + 10} ${CX + 8} ${y}`} fill="#FFFFFF" stroke={INK} strokeWidth={2} />;
    case 'smile':
      return <Path d={`M${CX - 6} ${y} Q${CX} ${y + 5} ${CX + 6} ${y}`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth={2} />;
    case 'flat':
      return <Line stroke={INK} strokeLinecap="round" strokeWidth={2} x1={CX - 6} x2={CX + 6} y1={y + 2} y2={y + 2} />;
    case 'tired':
      return <Path d={`M${CX - 7} ${y + 4} Q${CX} ${y - 2} ${CX + 7} ${y + 4}`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth={2} />;
    default:
      return <Ellipse cx={CX} cy={y + 3} fill={INK} rx={4} ry={3} />;
  }
}

function Eyes({ look, y }: { look: Look; y: number }) {
  const dx = 8;
  if (look.eyes === 'sleepy') {
    return (
      <G>
        <Path d={`M${CX - dx - 4} ${y} Q${CX - dx} ${y + 4} ${CX - dx + 4} ${y}`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth={2.2} />
        <Path d={`M${CX + dx - 4} ${y} Q${CX + dx} ${y + 4} ${CX + dx + 4} ${y}`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth={2.2} />
      </G>
    );
  }
  if (look.eyes === 'squint') {
    return (
      <G>
        <Line stroke={INK} strokeLinecap="round" strokeWidth={2.4} x1={CX - dx - 4} x2={CX - dx + 4} y1={y + 1} y2={y - 1} />
        <Line stroke={INK} strokeLinecap="round" strokeWidth={2.4} x1={CX + dx - 4} x2={CX + dx + 4} y1={y - 1} y2={y + 1} />
      </G>
    );
  }
  return (
    <G>
      <Circle cx={CX - dx} cy={y} fill={INK} r={3} />
      <Circle cx={CX + dx} cy={y} fill={INK} r={3} />
      <Circle cx={CX - dx + 1} cy={y - 1} fill="#FFFFFF" r={1} />
      <Circle cx={CX + dx + 1} cy={y - 1} fill="#FFFFFF" r={1} />
      {look.eyes === 'sparkle' ? (
        <>
          <Path d={`M${CX - dx - 9} ${y - 9} l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5z`} fill="#FFFFFF" />
          <Path d={`M${CX + dx + 9} ${y - 11} l1.2 2.4 2.4 1.2 -2.4 1.2 -1.2 2.4 -1.2 -2.4 -2.4 -1.2 2.4 -1.2z`} fill="#FFFFFF" />
        </>
      ) : null}
    </G>
  );
}

function Arms({ look, skinFill }: { look: Look; skinFill: string }) {
  const { shoulder, armW } = look;
  if (look.fit) {
    // ガッツポーズ (力こぶ)
    const left = `M${CX - shoulder} ${TORSO_TOP + 2} q-16 8 -14 -18`;
    const right = `M${CX + shoulder} ${TORSO_TOP + 2} q16 8 14 -18`;
    return (
      <G fill="none" strokeLinecap="round">
        <Path d={left} stroke={INK} strokeWidth={armW * 2 + 3} />
        <Path d={right} stroke={INK} strokeWidth={armW * 2 + 3} />
        <Path d={left} stroke={skinFill} strokeWidth={armW * 2} />
        <Path d={right} stroke={skinFill} strokeWidth={armW * 2} />
        <Circle cx={CX - shoulder - 14} cy={TORSO_TOP - 16} fill={skinFill} r={armW + 1} stroke={INK} strokeWidth={2} />
        <Circle cx={CX + shoulder + 14} cy={TORSO_TOP - 16} fill={skinFill} r={armW + 1} stroke={INK} strokeWidth={2} />
      </G>
    );
  }
  const left = `M${CX - shoulder + 2} ${TORSO_TOP + 4} q-10 20 -6 34`;
  const right = `M${CX + shoulder - 2} ${TORSO_TOP + 4} q10 20 6 34`;
  return (
    <G fill="none" strokeLinecap="round">
      <Path d={left} stroke={INK} strokeWidth={armW * 2 + 3} />
      <Path d={right} stroke={INK} strokeWidth={armW * 2 + 3} />
      <Path d={left} stroke={skinFill} strokeWidth={armW * 2} />
      <Path d={right} stroke={skinFill} strokeWidth={armW * 2} />
    </G>
  );
}

function Figure({ look }: { look: Look }) {
  const { shoulder, waist, headR, legW, suit } = look;
  const gradientId = `skin-${look.name}`;
  const skinFill = `url(#${gradientId})`;
  return (
    <Svg height="100%" viewBox={`0 0 ${W} ${H}`} width="100%">
      <Defs>
        <RadialGradient cx="0.5" cy="0.35" id={gradientId} r="0.75">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="0.35" stopColor={SKIN} />
          <Stop offset="1" stopColor={SKIN_DARK} />
        </RadialGradient>
      </Defs>
      {/* 脚 */}
      <Rect fill={suit} height={36} rx={legW} stroke={INK} strokeWidth={2} width={legW * 2} x={CX - waist * 0.6 - legW / 2} y={TORSO_BOTTOM - 4} />
      <Rect fill={suit} height={36} rx={legW} stroke={INK} strokeWidth={2} width={legW * 2} x={CX + waist * 0.6 - legW * 1.5} y={TORSO_BOTTOM - 4} />
      {/* 腕 */}
      <Arms look={look} skinFill={skinFill} />
      {/* 胴体 (ユニフォーム) */}
      <Path
        d={`M${CX - shoulder} ${TORSO_TOP} L${CX + shoulder} ${TORSO_TOP} Q${CX + waist + 4} ${(TORSO_TOP + TORSO_BOTTOM) / 2 - 3} ${CX + waist} ${TORSO_BOTTOM} L${CX - waist} ${TORSO_BOTTOM} Q${CX - waist - 4} ${(TORSO_TOP + TORSO_BOTTOM) / 2 - 3} ${CX - shoulder} ${TORSO_TOP}Z`}
        fill={suit}
        stroke={INK}
        strokeWidth={2.4}
      />
      {look.fit ? (
        <G stroke={INK} strokeOpacity={0.5} strokeWidth={1.5}>
          <Line x1={CX} x2={CX} y1={TORSO_TOP + 8} y2={TORSO_BOTTOM - 6} />
          <Line x1={CX - 8} x2={CX + 8} y1={TORSO_TOP + 16} y2={TORSO_TOP + 16} />
          <Line x1={CX - 7} x2={CX + 7} y1={TORSO_TOP + 26} y2={TORSO_TOP + 26} />
        </G>
      ) : null}
      {look.belly ? <Ellipse cx={CX} cy={TORSO_BOTTOM - 12} fill={skinFill} rx={waist * 0.8} ry={waist * 0.45} stroke={INK} strokeWidth={2} /> : null}
      {/* 首と頭 */}
      <Rect fill={skinFill} height={12} width={12} x={CX - 6} y={HEAD_CY + 10} />
      <Circle cx={CX} cy={HEAD_CY} fill={skinFill} r={headR} stroke={INK} strokeWidth={2.4} />
      <Path d={`M${CX - headR} ${HEAD_CY - 4} Q${CX} ${HEAD_CY - 24} ${CX + headR} ${HEAD_CY - 4} Q${CX} ${HEAD_CY - 12} ${CX - headR} ${HEAD_CY - 4}Z`} fill={HAIR} />
      {look.fit ? <Path d={`M${CX - headR + 1} ${HEAD_CY - 2} Q${CX} ${HEAD_CY - 8} ${CX + headR - 1} ${HEAD_CY - 2}`} fill="none" stroke="#E2C069" strokeLinecap="round" strokeWidth={4} /> : null}
      <Eyes look={look} y={FACE_Y} />
      <Mouth look={look} y={FACE_Y + 9} />
      {Array.from({ length: look.sweat }, (_, index) => (
        <Path d={`M${CX + headR + 2 + index * 7} ${HEAD_CY - 12 - index * 6} q4 6 0 9 q-4 -3 0 -9z`} fill="#8EC5FF" key={index} stroke="#3B82F6" strokeWidth={1} />
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
    // 標準体型は軽快にステップ、それ以外はゆっくり呼吸
    const bobDuration = look.fit ? 700 : 1500;
    bob.value = withDelay(delay, withRepeat(withSequence(withTiming(-size * 0.05, { duration: bobDuration, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: bobDuration, easing: Easing.in(Easing.quad) })), -1));
    breathe.value = withDelay(delay, withRepeat(withSequence(withTiming(1.04, { duration: 1300, easing: Easing.inOut(Easing.quad) }), withTiming(0.98, { duration: 1300, easing: Easing.inOut(Easing.quad) })), -1, true));
    tilt.value = withDelay(delay, withRepeat(withSequence(withTiming(-3, { duration: 1900, easing: Easing.inOut(Easing.sin) }), withTiming(3, { duration: 1900, easing: Easing.inOut(Easing.sin) })), -1, true));
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1600 }), withTiming(0.5, { duration: 1600 })), -1, true);
  }, [bob, breathe, tilt, glow, seed, size, look.fit]);
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
