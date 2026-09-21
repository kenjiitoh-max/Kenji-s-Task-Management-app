import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

const PURPLE = '#552583';
const GOLD = '#FDB927';

function Jersey({ number, id }: { number: string; id: string }) {
  return (
    <Svg height={72} viewBox="0 0 60 72" width={60}>
      <Defs>
        <LinearGradient id={`${id}-body`} x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor="#6B34A3" />
          <Stop offset="1" stopColor={PURPLE} />
        </LinearGradient>
      </Defs>
      <Path d="M18 4 L6 12 L10 26 L15 24 L15 68 L45 68 L45 24 L50 26 L54 12 L42 4 Q30 14 18 4 Z" fill={`url(#${id}-body)`} stroke={GOLD} strokeWidth={2} />
      <Path d="M18 4 Q30 14 42 4 Q30 20 18 4 Z" fill="#0F0819" stroke={GOLD} strokeWidth={1.5} />
      <Path d="M6 12 L10 26 L15 24 M54 12 L50 26 L45 24" fill="none" stroke={GOLD} strokeWidth={1.5} />
      <SvgText fill={GOLD} fontSize={9} fontWeight="700" textAnchor="middle" x={30} y={30}>LAKERS</SvgText>
      <SvgText fill={GOLD} fontSize={26} fontWeight="900" stroke="#FFFFFF" strokeWidth={0.6} textAnchor="middle" x={30} y={58}>{number}</SvgText>
    </Svg>
  );
}

function Swinging({ children, delay }: { children: React.ReactNode; delay: number }) {
  const sway = useSharedValue(0);
  useEffect(() => {
    sway.value = withDelay(delay, withRepeat(withSequence(withTiming(-3, { duration: 1600, easing: Easing.inOut(Easing.sin) }), withTiming(3, { duration: 1600, easing: Easing.inOut(Easing.sin) })), -1, true));
  }, [sway, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.value}deg` }] }));
  return <Animated.View style={[styles.hanger, style]}>{children}</Animated.View>;
}

export function KobeJerseys() {
  return (
    <View accessibilityLabel="Kobe Bryant 8 and 24 jerseys" style={styles.row}>
      <Swinging delay={0}><Jersey id="kobe8" number="8" /></Swinging>
      <Swinging delay={800}><Jersey id="kobe24" number="24" /></Swinging>
    </View>
  );
}

const styles = StyleSheet.create({
  hanger: { transformOrigin: 'top center' },
  row: { flexDirection: 'row', gap: 4 },
});
