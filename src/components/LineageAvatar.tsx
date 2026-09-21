import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import React, { useEffect } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Lineage } from '../growth/levels';

const INK = '#3B2166';
const GOLD = '#E2C069';
const CREAM = '#FFF7ED';
type Eyes = 'round' | 'fierce';

function Grad({ id, c1, c2 }: { id: string; c1: string; c2: string }) {
  return (
    <Defs>
      <RadialGradient cx="0.5" cy="0.35" id={id} r="0.75">
        <Stop offset="0" stopColor="#fff" stopOpacity="0.7" />
        <Stop offset="0.35" stopColor={c1} />
        <Stop offset="1" stopColor={c2} />
      </RadialGradient>
    </Defs>
  );
}

function Star({ x, y, s = 4, color = GOLD }: { x: number; y: number; s?: number; color?: string }) {
  return <Path d={`M${x} ${y - s} l${s * 0.4} ${s * 0.6} ${s * 0.6} ${s * 0.4} -${s * 0.6} ${s * 0.4} -${s * 0.4} ${s * 0.6} -${s * 0.4} -${s * 0.6} -${s * 0.6} -${s * 0.4} ${s * 0.6} -${s * 0.4}z`} fill={color} />;
}

function Crown({ x, y, w }: { x: number; y: number; w: number }) {
  return <Path d={`M${x - w} ${y} l${w * 0.3} -${w * 0.7} ${w * 0.35} ${w * 0.4} ${w * 0.35} -${w * 0.8} ${w * 0.35} ${w * 0.8} ${w * 0.35} -${w * 0.4} ${w * 0.3} ${w * 0.7}z`} fill={GOLD} stroke={INK} strokeWidth="2" />;
}

function EyePair({ x, y, kind, dx = 9 }: { x: number; y: number; kind: Eyes; dx?: number }) {
  if (kind === 'fierce') {
    return (
      <G>
        <Path d={`M${x - dx - 5} ${y - 3} l10 3 -10 3z M${x + dx + 5} ${y - 3} l-10 3 10 3z`} fill={INK} />
        <Circle cx={x - dx - 1} cy={y} fill="#fff" r="1.2" />
        <Circle cx={x + dx + 1} cy={y} fill="#fff" r="1.2" />
      </G>
    );
  }
  return (
    <G>
      <Circle cx={x - dx} cy={y} fill={INK} r="3.2" />
      <Circle cx={x + dx} cy={y} fill={INK} r="3.2" />
      <Circle cx={x - dx + 1} cy={y - 1} fill="#fff" r="1.1" />
      <Circle cx={x + dx + 1} cy={y - 1} fill="#fff" r="1.1" />
    </G>
  );
}

function Paws({ bx, by, B, fill }: { bx: number; by: number; B: number; fill: string }) {
  return (
    <G>
      <Ellipse cx={bx - B * 0.55} cy={by + B * 0.8} fill={fill} rx="9" ry="6" stroke={INK} strokeWidth="2" />
      <Ellipse cx={bx + B * 0.55} cy={by + B * 0.8} fill={fill} rx="9" ry="6" stroke={INK} strokeWidth="2" />
    </G>
  );
}

const BX = 70;
const BY = 92;

// ---- 英語: タイガー ----
type TigerLook = { body: number; head: number; fur: string; dark: string; stripes: number; eyes: Eyes; ext: 'abc' | 'book' | 'phone' | 'pass' | 'globe'; blue?: boolean; crown?: boolean };
const tigerLooks: TigerLook[] = [
  { body: 20, head: 19, fur: '#FFE0B2', dark: '#F5B26B', stripes: 0, eyes: 'round', ext: 'abc' },
  { body: 24, head: 20, fur: '#FFD199', dark: '#F59E42', stripes: 2, eyes: 'round', ext: 'book' },
  { body: 28, head: 21, fur: '#FFC175', dark: '#F28C28', stripes: 3, eyes: 'round', ext: 'phone' },
  { body: 32, head: 22, fur: '#FFB347', dark: '#E97E18', stripes: 4, eyes: 'fierce', ext: 'pass' },
  { body: 36, head: 23, fur: '#FFA630', dark: '#D9700F', stripes: 5, eyes: 'fierce', ext: 'globe' },
  { body: 38, head: 24, fur: '#F8FAFC', dark: '#CBD5E1', stripes: 5, eyes: 'fierce', ext: 'globe', blue: true },
  { body: 42, head: 25, fur: '#FFD166', dark: '#E2A100', stripes: 6, eyes: 'fierce', ext: 'globe', crown: true },
];

function Tiger({ index, id }: { index: number; id: string }) {
  const t = tigerLooks[index];
  const B = t.body;
  const Hd = t.head;
  const hy = 52;
  const inkS = t.blue ? '#334155' : '#2D1B12';
  const fill = `url(#${id})`;
  const tail = `M${BX + B - 6} ${BY + 8} q26 4 22 -24`;
  return (
    <G>
      <Grad c1={t.fur} c2={t.dark} id={id} />
      <Path d={tail} fill="none" stroke={inkS} strokeLinecap="round" strokeWidth="8" />
      <Path d={tail} fill="none" stroke={fill} strokeLinecap="round" strokeWidth="5" />
      <Ellipse cx={BX} cy={BY} fill={fill} rx={B} ry={B * 0.85} stroke={INK} strokeWidth="2.4" />
      {Array.from({ length: t.stripes }, (_, k) => {
        const a = -B * 0.8 + k * ((B * 1.6) / t.stripes) + (B * 0.8) / t.stripes;
        return <Path d={`M${BX + a} ${BY - B * 0.8} q${a > 0 ? -4 : 4} ${B * 0.5} 0 ${B * 0.9}`} fill="none" key={k} opacity="0.8" stroke={inkS} strokeLinecap="round" strokeWidth="3" />;
      })}
      <Ellipse cx={BX} cy={BY + B * 0.25} fill={CREAM} opacity="0.85" rx={B * 0.5} ry={B * 0.4} />
      <Paws B={B} bx={BX} by={BY} fill={fill} />
      <Circle cx={BX - Hd * 0.75} cy={hy - Hd * 0.7} fill={fill} r="7" stroke={INK} strokeWidth="2" />
      <Circle cx={BX + Hd * 0.75} cy={hy - Hd * 0.7} fill={fill} r="7" stroke={INK} strokeWidth="2" />
      <Circle cx={BX - Hd * 0.75} cy={hy - Hd * 0.7} fill="#FDBA74" r="3" />
      <Circle cx={BX + Hd * 0.75} cy={hy - Hd * 0.7} fill="#FDBA74" r="3" />
      <Circle cx={BX} cy={hy} fill={fill} r={Hd} stroke={INK} strokeWidth="2.4" />
      {t.stripes > 0 ? (
        <G stroke={inkS} strokeLinecap="round" strokeWidth="2.5">
          <Path d={`M${BX - 8} ${hy - Hd + 2} l3 8 M${BX} ${hy - Hd + 1} l0 9 M${BX + 8} ${hy - Hd + 2} l-3 8`} />
          <Path d={`M${BX - Hd + 2} ${hy + 2} l7 2 M${BX + Hd - 2} ${hy + 2} l-7 2`} />
        </G>
      ) : null}
      <Ellipse cx={BX} cy={hy + 8} fill={CREAM} rx="10" ry="7" />
      <Path d={`M${BX - 3} ${hy + 5} h6 l-3 3z`} fill={INK} />
      <Path d={`M${BX - 5} ${hy + 11} q5 4 10 0`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth="1.6" />
      <Path d={`M${BX - 14} ${hy + 7} h-8 M${BX - 14} ${hy + 10} h-7 M${BX + 14} ${hy + 7} h8 M${BX + 14} ${hy + 10} h7`} opacity="0.6" stroke={INK} strokeWidth="1.2" />
      <EyePair kind={t.eyes} x={BX} y={hy - 2} dx={8} />
      {t.blue ? <G><Circle cx={BX - 8} cy={hy - 2} fill="#38BDF8" r="2" /><Circle cx={BX + 8} cy={hy - 2} fill="#38BDF8" r="2" /></G> : null}
      {t.ext === 'abc' ? (
        <G>
          <SvgText fill={GOLD} fontSize="14" fontWeight="bold" x="18" y="44">A</SvgText>
          <SvgText fill="#C9B8E8" fontSize="12" x="106" y="52">b</SvgText>
          <SvgText fill="#C9B8E8" fontSize="10" x="30" y="28">c</SvgText>
        </G>
      ) : null}
      {t.ext === 'book' ? <G><Rect fill="#B91C1C" height="16" rx="2" stroke={INK} width="22" x="12" y="98" /><Path d="M15 104 h16 M15 108 h12" stroke="#FDE68A" strokeWidth="1" /></G> : null}
      {t.ext === 'phone' ? (
        <G>
          <Path d={`M${BX - Hd - 2} ${hy - Hd * 0.4} Q${BX} ${hy - Hd - 10} ${BX + Hd + 2} ${hy - Hd * 0.4}`} fill="none" stroke="#8B5FC7" strokeWidth="4" />
          <Rect fill="#8B5FC7" height="13" rx="3" width="9" x={BX - Hd - 6} y={hy - Hd * 0.5} />
          <Rect fill="#8B5FC7" height="13" rx="3" width="9" x={BX + Hd - 3} y={hy - Hd * 0.5} />
        </G>
      ) : null}
      {t.ext === 'pass' ? <G><Rect fill="#1E3A8A" height="26" rx="2" stroke={INK} width="20" x="100" y="86" /><SvgText fill={GOLD} fontSize="7" x="103" y="104">PASS</SvgText></G> : null}
      {t.ext === 'globe' ? <G><Circle cx="22" cy="100" fill="#1E3A8A" r="13" stroke={GOLD} strokeWidth="2" /><Path d="M12 96 q10 -5 20 0 M12 104 q10 5 20 0 M22 87 v26" fill="none" stroke={GOLD} strokeWidth="1.2" /></G> : null}
      {t.crown ? <Crown w={14} x={BX} y={hy - Hd + 2} /> : null}
      {index >= 4 ? <G><Star s={4} x={112} y={30} /><Star s={3} x={20} y={70} /></G> : null}
    </G>
  );
}

// ---- Devin: ドラゴン ----
type DragonLook = { body: number; head: number; wing: number; scale: string; dark: string; horn: number; fire: number; eyes: Eyes; laptop?: boolean; crown?: boolean };
const eggLook = { scale: '#C7D2FE', dark: '#6366F1' };
const dragonLooks: (DragonLook | null)[] = [
  null,
  { body: 20, head: 17, wing: 0, scale: '#A5F3FC', dark: '#06B6D4', horn: 4, fire: 0, eyes: 'round' },
  { body: 24, head: 18, wing: 14, scale: '#86EFAC', dark: '#16A34A', horn: 6, fire: 0, eyes: 'round' },
  { body: 28, head: 19, wing: 20, scale: '#93C5FD', dark: '#2563EB', horn: 8, fire: 1, eyes: 'round', laptop: true },
  { body: 32, head: 20, wing: 26, scale: '#C4B5FD', dark: '#7C3AED', horn: 10, fire: 2, eyes: 'fierce' },
  { body: 35, head: 21, wing: 32, scale: '#F9A8D4', dark: '#BE185D', horn: 12, fire: 2, eyes: 'fierce' },
  { body: 38, head: 22, wing: 38, scale: '#FDE68A', dark: '#C9A24C', horn: 14, fire: 3, eyes: 'fierce', crown: true },
];
const FIRE = ['#FB923C', '#F59E0B', '#FDE68A'];
const CODE_BITS: [number, number, string][] = [[16, 40, '{}'], [120, 50, '</>'], [14, 96, 'fn']];

function Dragon({ index, id }: { index: number; id: string }) {
  const d = dragonLooks[index];
  const fill = `url(#${id})`;
  if (!d) {
    return (
      <G>
        <Grad c1={eggLook.scale} c2={eggLook.dark} id={id} />
        <Ellipse cx="70" cy="80" fill={fill} rx="30" ry="38" stroke={INK} strokeWidth="2.4" />
        <Path d="M52 80 l8 -8 8 8 8 -8 8 8" fill="none" stroke={eggLook.dark} strokeWidth="2" />
        <Path d="M60 60 l4 6 M84 96 l-6 4" opacity="0.6" stroke="#fff" strokeWidth="2" />
        <EyePair kind="round" x={70} y={70} dx={7} />
        <Rect fill="#0F0819" height="8" rx="2" width="20" x="60" y="96" />
        <SvgText fill="#4ADE80" fontFamily="Courier" fontSize="6" x="62" y="102">v0.1</SvgText>
      </G>
    );
  }
  const B = d.body;
  const Hd = d.head;
  const hy = 52;
  const w = d.wing;
  const tail = `M${BX + B * 0.5} ${BY + B * 0.5} q30 6 24 -22`;
  return (
    <G>
      <Grad c1={d.scale} c2={d.dark} id={id} />
      {w ? <Path d={`M${BX - B * 0.6} ${BY - B * 0.6} q-${w} -${w * 1.2} -${w * 1.4} -${w * 0.2} q${w * 0.6} 2 ${w * 0.9} ${w * 0.5} z M${BX + B * 0.6} ${BY - B * 0.6} q${w} -${w * 1.2} ${w * 1.4} -${w * 0.2} q-${w * 0.6} 2 -${w * 0.9} ${w * 0.5} z`} fill={d.dark} opacity="0.9" stroke={INK} strokeWidth="2" /> : null}
      <Path d={tail} fill="none" stroke={INK} strokeLinecap="round" strokeWidth="8" />
      <Path d={tail} fill="none" stroke={fill} strokeLinecap="round" strokeWidth="5" />
      <Path d={`M${BX + B * 0.5 + 22} ${BY + B * 0.5 - 24} l6 -8 3 9z`} fill={d.dark} stroke={INK} strokeWidth="1.5" />
      <Ellipse cx={BX} cy={BY} fill={fill} rx={B} ry={B * 0.85} stroke={INK} strokeWidth="2.4" />
      <Ellipse cx={BX} cy={BY + B * 0.2} fill={CREAM} opacity="0.7" rx={B * 0.5} ry={B * 0.45} />
      <Path d={`M${BX - B * 0.3} ${BY} h${B * 0.6} M${BX - B * 0.3} ${BY + B * 0.25} h${B * 0.6} M${BX - B * 0.25} ${BY + B * 0.5} h${B * 0.5}`} opacity="0.6" stroke={d.dark} strokeWidth="1.5" />
      <Ellipse cx={BX - B * 0.5} cy={BY + B * 0.8} fill={fill} rx="9" ry="6" stroke={INK} strokeWidth="2" />
      <Ellipse cx={BX + B * 0.5} cy={BY + B * 0.8} fill={fill} rx="9" ry="6" stroke={INK} strokeWidth="2" />
      <Path d={`M${BX - Hd * 0.6} ${hy - Hd * 0.7} l-${d.horn * 0.6} -${d.horn} l${d.horn * 0.9} ${d.horn * 0.4}z M${BX + Hd * 0.6} ${hy - Hd * 0.7} l${d.horn * 0.6} -${d.horn} l-${d.horn * 0.9} ${d.horn * 0.4}z`} fill="#FDE68A" stroke={INK} strokeWidth="2" />
      <Circle cx={BX} cy={hy} fill={fill} r={Hd} stroke={INK} strokeWidth="2.4" />
      <Ellipse cx={BX} cy={hy + 9} fill={fill} rx="12" ry="7" stroke={INK} strokeWidth="2" />
      <Circle cx={BX - 4} cy={hy + 8} fill={INK} r="1.5" />
      <Circle cx={BX + 4} cy={hy + 8} fill={INK} r="1.5" />
      <EyePair kind={d.eyes} x={BX} y={hy - 3} dx={8} />
      {Array.from({ length: d.fire }, (_, k) => <Path d={`M${BX + Hd + 4 + k * 8} ${hy + 8 - k * 2} q6 -8 4 -14 q6 8 -2 16 q-4 -1 -2 -2z`} fill={FIRE[k]} key={k} stroke="#B45309" strokeWidth="1" />)}
      {d.laptop ? <G><Rect fill="#1F2937" height="18" rx="3" stroke={INK} strokeWidth="1.5" width="32" x={BX - 16} y={BY + B * 0.35} /><SvgText fill="#4ADE80" fontFamily="Courier" fontSize="7" x={BX - 13} y={BY + B * 0.35 + 12}>{'> build'}</SvgText></G> : null}
      {index >= 4 ? CODE_BITS.map(([x, y, label]) => <G key={label}><Circle cx={x} cy={y} fill="#1B1030" r="7" stroke="#8B5FC7" strokeWidth="1.5" /><SvgText fill={GOLD} fontFamily="Courier" fontSize="8" x={x - 4} y={y + 3}>{label}</SvgText></G>) : null}
      {d.crown ? <Crown w={13} x={BX} y={hy - Hd + 3} /> : null}
    </G>
  );
}

// ---- 筋トレ: ゴリラ ----
type GorillaLook = { body: number; head: number; fur: string; dark: string; arms: number; eyes: Eyes; ext: 'banana' | 'band' | 'dumbbell' | 'gloves' | 'medal' | 'trophy'; flex?: boolean; silver?: boolean; crown?: boolean };
const gorillaLooks: GorillaLook[] = [
  { body: 20, head: 17, fur: '#9CA3AF', dark: '#4B5563', arms: 6, eyes: 'round', ext: 'banana' },
  { body: 24, head: 18, fur: '#9CA3AF', dark: '#4B5563', arms: 8, eyes: 'round', ext: 'band' },
  { body: 28, head: 19, fur: '#8B93A3', dark: '#374151', arms: 10, eyes: 'round', ext: 'dumbbell' },
  { body: 32, head: 20, fur: '#8B93A3', dark: '#374151', arms: 12, eyes: 'fierce', ext: 'gloves' },
  { body: 35, head: 21, fur: '#6B7280', dark: '#1F2937', arms: 14, eyes: 'fierce', ext: 'medal', flex: true },
  { body: 38, head: 22, fur: '#6B7280', dark: '#1F2937', arms: 16, eyes: 'fierce', ext: 'medal', flex: true, silver: true },
  { body: 42, head: 23, fur: '#4B5563', dark: '#0B0F1A', arms: 18, eyes: 'fierce', ext: 'trophy', flex: true, silver: true, crown: true },
];

function Gorilla({ index, id }: { index: number; id: string }) {
  const g = gorillaLooks[index];
  const B = g.body;
  const Hd = g.head;
  const hy = 50;
  const fill = `url(#${id})`;
  const arms = g.flex
    ? `M${BX - B * 0.8} ${BY - B * 0.5} q-22 4 -18 -26 M${BX + B * 0.8} ${BY - B * 0.5} q22 4 18 -26`
    : `M${BX - B * 0.7} ${BY - B * 0.4} q-14 20 -8 40 M${BX + B * 0.7} ${BY - B * 0.4} q14 20 8 40`;
  const fistL = g.flex ? [BX - B * 0.8 - 18, BY - B * 0.5 - 26] : [BX - B * 0.7 - 8, BY - B * 0.4 + 40];
  const fistR = g.flex ? [BX + B * 0.8 + 18, BY - B * 0.5 - 26] : [BX + B * 0.7 + 8, BY - B * 0.4 + 40];
  const fistR_ = g.flex ? g.arms * 0.9 : g.arms * 0.8;
  const fistFill = g.ext === 'gloves' ? '#B91C1C' : '#D6D3D1';
  return (
    <G>
      <Grad c1={g.fur} c2={g.dark} id={id} />
      <Path d={arms} fill="none" stroke={INK} strokeLinecap="round" strokeWidth={g.arms * 2 + 3} />
      <Path d={arms} fill="none" stroke={fill} strokeLinecap="round" strokeWidth={g.arms * 2} />
      <Circle cx={fistL[0]} cy={fistL[1]} fill={fistFill} r={fistR_} stroke={INK} strokeWidth="2" />
      <Circle cx={fistR[0]} cy={fistR[1]} fill={fistFill} r={fistR_} stroke={INK} strokeWidth="2" />
      <Ellipse cx={BX} cy={BY} fill={fill} rx={B} ry={B * 0.85} stroke={INK} strokeWidth="2.4" />
      {g.silver ? <Path d={`M${BX - B * 0.7} ${BY - B * 0.6} q${B * 0.7} -10 ${B * 1.4} 0 q-${B * 0.2} ${B * 0.5} -${B * 0.7} ${B * 0.6} q-${B * 0.5} -${B * 0.1} -${B * 0.7} -${B * 0.6}z`} fill="#CBD5E1" opacity="0.8" /> : null}
      <Ellipse cx={BX} cy={BY + B * 0.2} fill="#9CA3AF" opacity="0.8" rx={B * 0.55} ry={B * 0.5} />
      {index >= 3 ? (
        <G stroke={INK} strokeOpacity="0.5" strokeWidth="1.5">
          <Line x1={BX} x2={BX} y1={BY - B * 0.1} y2={BY + B * 0.6} />
          <Line x1={BX - 8} x2={BX + 8} y1={BY + B * 0.1} y2={BY + B * 0.1} />
          <Line x1={BX - 7} x2={BX + 7} y1={BY + B * 0.35} y2={BY + B * 0.35} />
        </G>
      ) : null}
      <Ellipse cx={BX - B * 0.5} cy={BY + B * 0.85} fill={g.dark} rx="10" ry="6" stroke={INK} strokeWidth="2" />
      <Ellipse cx={BX + B * 0.5} cy={BY + B * 0.85} fill={g.dark} rx="10" ry="6" stroke={INK} strokeWidth="2" />
      <Ellipse cx={BX} cy={hy - Hd * 0.3} fill={fill} rx={Hd * 0.9} ry={Hd * 0.6} stroke={INK} strokeWidth="2.4" />
      <Circle cx={BX} cy={hy} fill={fill} r={Hd} stroke={INK} strokeWidth="2.4" />
      <Circle cx={BX - Hd * 0.9} cy={hy} fill={fill} r="5" stroke={INK} strokeWidth="2" />
      <Circle cx={BX + Hd * 0.9} cy={hy} fill={fill} r="5" stroke={INK} strokeWidth="2" />
      <Path d={`M${BX - Hd * 0.7} ${hy + 2} q${Hd * 0.7} -${Hd * 0.3} ${Hd * 1.4} 0 q0 ${Hd * 0.8} -${Hd * 0.7} ${Hd * 0.8} q-${Hd * 0.7} 0 -${Hd * 0.7} -${Hd * 0.8}z`} fill="#9CA3AF" />
      <Ellipse cx={BX - 4} cy={hy + 8} fill={INK} rx="2.5" ry="1.8" />
      <Ellipse cx={BX + 4} cy={hy + 8} fill={INK} rx="2.5" ry="1.8" />
      <Path d={`M${BX - 6} ${hy + 14} q6 ${g.eyes === 'fierce' ? -3 : 3} 12 0`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth="1.8" />
      <Path d={`M${BX - 12} ${hy - 8} l8 3 M${BX + 12} ${hy - 8} l-8 3`} stroke={INK} strokeLinecap="round" strokeWidth="2.5" />
      <EyePair kind={g.eyes} x={BX} y={hy - 2} dx={7} />
      {index >= 1 ? <Path d={`M${BX - Hd + 1} ${hy - 8} Q${BX} ${hy - 14} ${BX + Hd - 1} ${hy - 8}`} fill="none" stroke={GOLD} strokeLinecap="round" strokeWidth="4" /> : null}
      {g.ext === 'banana' ? <Path d="M100 96 q14 -4 16 -18 q6 12 -6 20 q-6 2 -10 -2z" fill="#FDE047" stroke={INK} strokeWidth="1.5" /> : null}
      {g.ext === 'dumbbell' ? <G><Rect fill="#6B7280" height="5" stroke={INK} width="30" x="8" y="98" /><Rect fill="#374151" height="17" rx="2" stroke={INK} width="7" x="6" y="92" /><Rect fill="#374151" height="17" rx="2" stroke={INK} width="7" x="33" y="92" /></G> : null}
      {g.ext === 'medal' ? <G><Path d={`M${BX - 6} ${BY - B * 0.6} l6 10 6 -10`} fill="none" stroke="#B91C1C" strokeWidth="3" /><Circle cx={BX} cy={BY - B * 0.6 + 12} fill={GOLD} r="6" stroke={INK} strokeWidth="1.5" /></G> : null}
      {g.ext === 'trophy' ? <G><Path d="M8 84 h22 v10 q0 12 -11 12 q-11 0 -11 -12z" fill={GOLD} stroke={INK} strokeWidth="1.5" /><Rect fill={GOLD} height="6" stroke={INK} width="10" x="14" y="106" /><Rect fill="#B45309" height="4" stroke={INK} width="18" x="10" y="112" /></G> : null}
      {g.crown ? <Crown w={14} x={BX} y={hy - Hd - 6} /> : null}
      {index >= 4 ? <G><Star s={4} x={118} y={36} /><Star s={3} x={22} y={60} /></G> : null}
    </G>
  );
}

// ---- 営業: ライオン ----
type LionLook = { body: number; head: number; fur: string; dark: string; mane: number; eyes: Eyes; ext: 'none' | 'tie' | 'case' | 'coins'; gold?: boolean; crown?: boolean };
const lionLooks: LionLook[] = [
  { body: 20, head: 18, fur: '#FDE68A', dark: '#D9A441', mane: 0, eyes: 'round', ext: 'none' },
  { body: 24, head: 19, fur: '#FCD34D', dark: '#D29B2B', mane: 4, eyes: 'round', ext: 'tie' },
  { body: 28, head: 20, fur: '#FBBF24', dark: '#B7791F', mane: 8, eyes: 'round', ext: 'tie' },
  { body: 32, head: 21, fur: '#F59E0B', dark: '#A16207', mane: 12, eyes: 'fierce', ext: 'case' },
  { body: 35, head: 22, fur: '#F59E0B', dark: '#92400E', mane: 15, eyes: 'fierce', ext: 'case', gold: true },
  { body: 38, head: 23, fur: '#EA8C0B', dark: '#7C2D12', mane: 18, eyes: 'fierce', ext: 'coins', gold: true },
  { body: 42, head: 24, fur: '#FFD166', dark: '#B45309', mane: 21, eyes: 'fierce', ext: 'coins', gold: true, crown: true },
];

function manePath(cx: number, cy: number, R: number): string {
  const n = 14;
  let d = '';
  for (let k = 0; k < n; k++) {
    const a1 = (k / n) * Math.PI * 2;
    const a2 = ((k + 0.5) / n) * Math.PI * 2;
    const a3 = ((k + 1) / n) * Math.PI * 2;
    const x1 = cx + Math.cos(a1) * R * 0.85;
    const y1 = cy + Math.sin(a1) * R * 0.85;
    d += `${k ? '' : `M${x1} ${y1}`} Q${cx + Math.cos(a2) * R} ${cy + Math.sin(a2) * R} ${cx + Math.cos(a3) * R * 0.85} ${cy + Math.sin(a3) * R * 0.85}`;
  }
  return `${d}z`;
}

function Lion({ index, id }: { index: number; id: string }) {
  const l = lionLooks[index];
  const B = l.body;
  const Hd = l.head;
  const hy = 50;
  const fill = `url(#${id})`;
  const maneC = l.gold ? '#B45309' : '#C2410C';
  const tail = `M${BX + B - 6} ${BY + 8} q26 4 22 -24`;
  return (
    <G>
      <Grad c1={l.fur} c2={l.dark} id={id} />
      <Path d={tail} fill="none" stroke={INK} strokeLinecap="round" strokeWidth="7" />
      <Path d={tail} fill="none" stroke={fill} strokeLinecap="round" strokeWidth="4" />
      <Circle cx={BX + B + 16} cy={BY - 17} fill={maneC} r="5" stroke={INK} strokeWidth="1.5" />
      <Ellipse cx={BX} cy={BY} fill={fill} rx={B} ry={B * 0.85} stroke={INK} strokeWidth="2.4" />
      <Ellipse cx={BX} cy={BY + B * 0.25} fill={CREAM} opacity="0.8" rx={B * 0.5} ry={B * 0.4} />
      {l.ext !== 'none' ? <Path d={`M${BX - 4} ${BY - B * 0.6} h8 l-2 6 h-4z M${BX - 3} ${BY - B * 0.6 + 6} h6 l2 ${B * 0.5} -5 6 -5 -6z`} fill={l.gold ? GOLD : '#B91C1C'} stroke={INK} strokeWidth="1.5" /> : null}
      <Paws B={B} bx={BX} by={BY} fill={fill} />
      {l.mane ? (
        <G>
          <Path d={manePath(BX, hy, Hd + l.mane)} fill={maneC} stroke={INK} strokeWidth="2.2" />
          <Circle cx={BX} cy={hy} fill={l.gold ? '#D97706' : '#EA580C'} opacity="0.6" r={Hd + l.mane * 0.45} />
        </G>
      ) : null}
      <Circle cx={BX - Hd * 0.75} cy={hy - Hd * 0.7} fill={fill} r="6" stroke={INK} strokeWidth="2" />
      <Circle cx={BX + Hd * 0.75} cy={hy - Hd * 0.7} fill={fill} r="6" stroke={INK} strokeWidth="2" />
      <Circle cx={BX} cy={hy} fill={fill} r={Hd} stroke={INK} strokeWidth="2.4" />
      <Ellipse cx={BX} cy={hy + 8} fill={CREAM} rx="10" ry="7" />
      <Path d={`M${BX - 3} ${hy + 5} h6 l-3 3z`} fill={INK} />
      <Path d={`M${BX - 5} ${hy + 11} q5 ${l.eyes === 'fierce' ? 3 : 4} 10 0`} fill="none" stroke={INK} strokeLinecap="round" strokeWidth="1.6" />
      {l.eyes === 'fierce' ? <Path d={`M${BX - 14} ${hy - 9} l8 3 M${BX + 14} ${hy - 9} l-8 3`} stroke={INK} strokeLinecap="round" strokeWidth="2.5" /> : null}
      <EyePair kind={l.eyes} x={BX} y={hy - 2} dx={8} />
      {l.ext === 'case' ? <G><Rect fill="#5B3A1A" height="18" rx="3" stroke={INK} strokeWidth="1.5" width="26" x="8" y="94" /><Rect fill="none" height="5" rx="1" stroke={INK} strokeWidth="1.5" width="10" x="16" y="90" /><Rect fill={GOLD} height="4" width="6" x="18" y="101" /></G> : null}
      {l.ext === 'coins' ? (
        <G>
          <Ellipse cx="18" cy="108" fill={GOLD} rx="12" ry="4" stroke={INK} />
          <Ellipse cx="18" cy="103" fill="#FDE68A" rx="12" ry="4" stroke={INK} />
          <Ellipse cx="18" cy="98" fill={GOLD} rx="12" ry="4" stroke={INK} />
          <SvgText fill={INK} fontSize="6" fontWeight="bold" x="14" y="100">¥</SvgText>
        </G>
      ) : null}
      {l.crown ? <Crown w={14} x={BX} y={hy - Hd - l.mane * 0.6} /> : null}
      {index >= 4 ? <G><Star s={4} x={118} y={32} /><Star s={3} x={22} y={64} /></G> : null}
    </G>
  );
}

// ---- 読書: フクロウ ----
type OwlLook = { body: number; head: number; fur: string; dark: string; glasses?: boolean; books: number; cap?: boolean; shelf?: boolean; crown?: boolean; peek?: boolean };
const owlLooks: OwlLook[] = [
  { body: 0, head: 22, fur: '#FDE68A', dark: '#B45309', books: 0, peek: true },
  { body: 22, head: 20, fur: '#E7D3A6', dark: '#8B6534', books: 0 },
  { body: 27, head: 22, fur: '#D8C5A0', dark: '#7C5A2B', books: 1 },
  { body: 30, head: 24, fur: '#D8C5A0', dark: '#7C5A2B', books: 3, glasses: true },
  { body: 33, head: 25, fur: '#CBB48C', dark: '#6B4A22', books: 3, glasses: true, cap: true },
  { body: 36, head: 26, fur: '#E9DDFB', dark: '#8B5FC7', books: 4, glasses: true, cap: true },
  { body: 38, head: 27, fur: '#F3E9FF', dark: '#8B5FC7', books: 4, glasses: true, shelf: true, crown: true },
];
const BOOK_COLORS = ['#B91C1C', '#1E3A8A', '#166534', GOLD, '#8B5FC7'];

function Owl({ index, id }: { index: number; id: string }) {
  const o = owlLooks[index];
  const fill = `url(#${id})`;
  if (o.peek) {
    return (
      <G>
        <Grad c1={o.fur} c2={o.dark} id={id} />
        <Rect fill="#8B5FC7" height="38" rx="4" stroke={INK} strokeWidth="2" width="52" x="44" y="96" />
        <Rect fill="#F5F0E1" height="38" rx="4" stroke={INK} strokeWidth="2" width="52" x="48" y="92" />
        <Path d="M54 100 h40 M54 108 h40 M54 116 h30" stroke="#C9B8E8" strokeWidth="1.5" />
        <Ellipse cx="72" cy="78" fill={fill} rx="24" ry="26" stroke={INK} strokeWidth="2.4" />
        <Circle cx="63" cy="74" fill="#fff" r="7" />
        <Circle cx="81" cy="74" fill="#fff" r="7" />
        <EyePair kind="round" x={72} y={74} dx={9} />
        <Path d="M68 84 l4 4 4 -4z" fill="#F97316" />
        <Path d="M52 60 l6 -12 8 8 M92 60 l-6 -12 -8 8" fill={fill} stroke={INK} strokeWidth="2" />
      </G>
    );
  }
  const B = o.body;
  const Hd = o.head;
  const hy = 54;
  const by = 98;
  return (
    <G>
      <Grad c1={o.fur} c2={o.dark} id={id} />
      {o.shelf ? (
        <G>
          <Rect fill="#2B1B45" height="90" stroke="#6E5326" strokeWidth="2" width="116" x="12" y="50" />
          {[0, 1, 2].map((r) => Array.from({ length: 10 }, (_, i) => <Rect fill={BOOK_COLORS[(i + r) % 5]} height={20 + ((i * 7) % 5)} key={`${r}-${i}`} width="9" x={16 + i * 11} y={54 + r * 28} />))}
        </G>
      ) : null}
      <Ellipse cx={BX} cy={by} fill={fill} rx={B} ry={B * 1.05} stroke={INK} strokeWidth="2.4" />
      <Ellipse cx={BX} cy={by + B * 0.15} fill="#F5E7C8" rx={B * 0.55} ry={B * 0.65} stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />
      <Path d={`M${BX - B * 0.3} ${by - B * 0.2} q${B * 0.3} 6 ${B * 0.6} 0 M${BX - B * 0.3} ${by + B * 0.15} q${B * 0.3} 6 ${B * 0.6} 0 M${BX - B * 0.25} ${by + B * 0.5} q${B * 0.25} 6 ${B * 0.5} 0`} fill="none" opacity="0.5" stroke={o.dark} strokeWidth="1.5" />
      <Path d={`M${BX - B} ${by - B * 0.5} q-8 ${B * 0.8} 2 ${B * 1.3} M${BX + B} ${by - B * 0.5} q8 ${B * 0.8} -2 ${B * 1.3}`} fill="none" stroke={o.dark} strokeLinecap="round" strokeWidth="6" />
      <Path d={`M${BX - 10} ${by + B * 1.02} l-3 6 M${BX - 7} ${by + B * 1.02} l0 6 M${BX - 4} ${by + B * 1.02} l3 6 M${BX + 4} ${by + B * 1.02} l-3 6 M${BX + 7} ${by + B * 1.02} l0 6 M${BX + 10} ${by + B * 1.02} l3 6`} stroke="#F97316" strokeLinecap="round" strokeWidth="2" />
      <Path d={`M${BX - Hd * 0.85} ${hy - Hd * 0.6} l4 -14 11 8 M${BX + Hd * 0.85} ${hy - Hd * 0.6} l-4 -14 -11 8`} fill={fill} stroke={INK} strokeWidth="2" />
      <Circle cx={BX} cy={hy} fill={fill} r={Hd} stroke={INK} strokeWidth="2.4" />
      <Circle cx={BX - 10} cy={hy - 2} fill="#fff" r={o.glasses ? 10 : 8} stroke={o.glasses ? GOLD : INK} strokeOpacity={o.glasses ? 1 : 0.3} strokeWidth={o.glasses ? 2.5 : 1} />
      <Circle cx={BX + 10} cy={hy - 2} fill="#fff" r={o.glasses ? 10 : 8} stroke={o.glasses ? GOLD : INK} strokeOpacity={o.glasses ? 1 : 0.3} strokeWidth={o.glasses ? 2.5 : 1} />
      {o.glasses ? <Line stroke={GOLD} strokeWidth="2.5" x1={BX - 1} x2={BX + 1} y1={hy - 3} y2={hy - 3} /> : null}
      <Circle cx={BX - 10} cy={hy - 2} fill={INK} r="4" />
      <Circle cx={BX + 10} cy={hy - 2} fill={INK} r="4" />
      <Circle cx={BX - 9} cy={hy - 3} fill="#fff" r="1.3" />
      <Circle cx={BX + 11} cy={hy - 3} fill="#fff" r="1.3" />
      <Path d={`M${BX - 4} ${hy + 8} l4 5 4 -5z`} fill="#F97316" />
      {o.cap ? <G><Path d={`M${BX - Hd - 4} ${hy - Hd * 0.7} L${BX} ${hy - Hd - 10} L${BX + Hd + 4} ${hy - Hd * 0.7} L${BX} ${hy - Hd * 0.4}z`} fill="#1F1233" stroke={INK} strokeWidth="2" /><Path d={`M${BX + Hd} ${hy - Hd * 0.7} v12`} stroke={GOLD} strokeWidth="2" /><Circle cx={BX + Hd} cy={hy - Hd * 0.7 + 13} fill={GOLD} r="2.5" /></G> : null}
      {o.books >= 1 ? <Rect fill="#B91C1C" height="8" stroke={INK} width="30" x="6" y="122" /> : null}
      {o.books >= 2 ? <Rect fill="#1E3A8A" height="8" stroke={INK} width="30" x="10" y="114" /> : null}
      {o.books >= 3 ? <Rect fill="#166534" height="8" stroke={INK} width="26" x="8" y="106" /> : null}
      {o.books >= 4 ? <Rect fill={GOLD} height="8" stroke={INK} width="24" x="12" y="98" /> : null}
      {o.books >= 3 ? <Path d={`M${BX + B * 0.6} ${by + B * 0.95} q14 -8 26 0 q-12 8 -26 0`} fill="#F5F0E1" stroke={INK} strokeWidth="1.5" /> : null}
      {index >= 5 ? <G><Path d={`M${BX - 18} ${by - B * 0.7} q18 -10 36 0`} fill="none" stroke={GOLD} strokeWidth="3" /><Circle cx={BX} cy={by - B * 0.7 + 4} fill={GOLD} r="5" /></G> : null}
      {o.crown ? <Crown w={14} x={BX} y={hy - Hd + 2} /> : null}
      {index >= 4 ? <G><Star s={5} x={22} y={34} /><Star s={4} x={120} y={40} /></G> : null}
    </G>
  );
}

const renderers: Record<Lineage, (props: { index: number; id: string }) => React.JSX.Element> = {
  bird: Tiger,
  engineer: Dragon,
  reader: Owl,
  athlete: Gorilla,
  sales: Lion,
};

const motion: Record<Lineage, { bob: number; tilt: number; duration: number }> = {
  bird: { bob: 0.04, tilt: 4, duration: 900 },
  engineer: { bob: 0.07, tilt: 2, duration: 1300 },
  reader: { bob: 0.02, tilt: 3, duration: 2000 },
  athlete: { bob: 0.03, tilt: 0, duration: 550 },
  sales: { bob: 0.03, tilt: 5, duration: 1500 },
};

export function LineageAvatar({ lineage, stageIndex, size, animated = true, seed = 0 }: {
  lineage: Lineage;
  stageIndex: number;
  size: number;
  animated?: boolean;
  seed?: number;
}) {
  const Renderer = renderers[lineage];
  const index = Math.max(0, Math.min(6, stageIndex));
  const bob = useSharedValue(0);
  const tilt = useSharedValue(0);
  const squash = useSharedValue(1);
  useEffect(() => {
    if (!animated) return;
    const m = motion[lineage];
    const delay = (seed * 173) % 900;
    bob.value = withDelay(delay, withRepeat(withSequence(
      withTiming(-size * m.bob, { duration: m.duration, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: m.duration, easing: Easing.in(Easing.quad) }),
    ), -1));
    tilt.value = withDelay(delay, withRepeat(withSequence(
      withTiming(-m.tilt, { duration: m.duration * 2, easing: Easing.inOut(Easing.sin) }),
      withTiming(m.tilt, { duration: m.duration * 2, easing: Easing.inOut(Easing.sin) }),
    ), -1, true));
    squash.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1.03, { duration: m.duration, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.98, { duration: m.duration, easing: Easing.inOut(Easing.quad) }),
    ), -1, true));
  }, [animated, lineage, seed, size, bob, tilt, squash]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }, { rotate: `${tilt.value}deg` }, { scaleX: 2 - squash.value }, { scaleY: squash.value }],
  }));
  return (
    <Animated.View style={[{ height: size, width: size }, style]}>
      <Svg height={size} viewBox="0 0 140 130" width={size}>
        <Renderer id={`${lineage}-${index}-${seed}`} index={index} />
      </Svg>
    </Animated.View>
  );
}
