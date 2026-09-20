import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { getPalette } from '../../theme';

type Bar = { x: string; y: number };

export function BarChart({ bars, color, dark, height = 160 }: {
  bars: Bar[];
  color: string;
  dark: boolean;
  height?: number;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  if (bars.length === 0) return <Text style={[styles.empty, { color: palette.muted }]}>まだ記録がありません</Text>;
  const padding = { top: 22, right: 12, bottom: 26, left: 28 };
  const chartWidth = Math.max(1, width - padding.left - padding.right);
  const chartHeight = Math.max(1, height - padding.top - padding.bottom);
  const max = Math.max(1, ...bars.map((bar) => bar.y));
  const slotWidth = chartWidth / bars.length;
  const barWidth = Math.max(2, slotWidth * 0.62);
  return (
    <View onLayout={onLayout} style={[styles.container, { height }]}>
      {width > 0 ? <Svg height={height} width={width}>
        <SvgText fill={palette.muted} fontSize="10" x={4} y={padding.top + 3}>{max}</SvgText>
        <Rect fill={palette.border} height="1" width={chartWidth} x={padding.left} y={height - padding.bottom} />
        {bars.map((bar, index) => {
          const barHeight = (bar.y / max) * chartHeight;
          const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = height - padding.bottom - barHeight;
          return <Rect fill={bar.y === 0 ? `${color}22` : color} height={Math.max(1, barHeight)} key={`${bar.x}-${index}`} rx="3" width={barWidth} x={x} y={bar.y === 0 ? height - padding.bottom - 1 : y} />;
        })}
        <SvgText fill={palette.muted} fontSize="10" x={padding.left} y={height - 7}>{bars[0].x.slice(5).replace('-', '/')}</SvgText>
        <SvgText fill={palette.muted} fontSize="10" textAnchor="end" x={width - padding.right} y={height - 7}>{bars[bars.length - 1].x.slice(5).replace('-', '/')}</SvgText>
      </Svg> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  empty: { fontSize: 13, paddingVertical: 35, textAlign: 'center' },
});
