import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { getPalette } from '../../theme';

type Point = { x: string; y: number };
type Marker = { x: string; label: string };

export function LineChart({ points, color, dark, height = 160, unit, markers = [] }: {
  points: Point[];
  color: string;
  dark: boolean;
  height?: number;
  unit?: string;
  markers?: Marker[];
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  if (points.length < 2) {
    return <Text style={[styles.empty, { color: palette.muted }]}>データが2件以上たまるとグラフが表示されます</Text>;
  }
  const padding = { top: 22, right: 38, bottom: 26, left: 38 };
  const chartWidth = Math.max(1, width - padding.left - padding.right);
  const chartHeight = Math.max(1, height - padding.top - padding.bottom);
  const values = points.map((point) => point.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max === min ? 1 : max - min;
  const xFor = (index: number) => padding.left + (points.length === 1 ? 0 : (index / (points.length - 1)) * chartWidth);
  const yFor = (value: number) => padding.top + ((max - value) / range) * chartHeight;
  const polyline = points.map((point, index) => `${xFor(index)},${yFor(point.y)}`).join(' ');
  const markerIndexes = markers.map((marker) => ({ ...marker, index: points.findIndex((point) => point.x === marker.x) })).filter((marker) => marker.index >= 0);
  const formatValue = (value: number) => `${value.toFixed(1)}${unit ? ` ${unit}` : ''}`;
  return (
    <View onLayout={onLayout} style={[styles.container, { height }]}>
      {width > 0 ? <Svg height={height} width={width}>
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + ratio * chartHeight;
          const value = max - ratio * (max - min);
          return <React.Fragment key={ratio}><Line stroke={palette.border} strokeWidth="1" x1={padding.left} x2={width - padding.right} y1={y} y2={y} /><SvgText fill={palette.muted} fontSize="10" x={4} y={y + 3}>{value.toFixed(1)}</SvgText></React.Fragment>;
        })}
        {markerIndexes.map((marker) => {
          const x = xFor(marker.index);
          return <React.Fragment key={`${marker.x}-${marker.label}`}><Line stroke={color} strokeDasharray="3 3" strokeWidth="1" x1={x} x2={x} y1={padding.top} y2={height - padding.bottom} /><SvgText fill={color} fontSize="10" fontWeight="bold" x={x + 3} y={padding.top - 6}>{marker.label}</SvgText></React.Fragment>;
        })}
        <Polyline fill="none" points={polyline} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        {points.map((point, index) => <Circle cx={xFor(index)} cy={yFor(point.y)} fill={palette.card} key={`${point.x}-${index}`} r="3.5" stroke={color} strokeWidth="2" />)}
        <SvgText fill={color} fontSize="11" fontWeight="bold" x={Math.min(width - padding.right + 3, xFor(points.length - 1) + 5)} y={Math.max(padding.top + 10, yFor(points[points.length - 1].y) - 7)}>{formatValue(points[points.length - 1].y)}</SvgText>
        <SvgText fill={palette.muted} fontSize="10" x={padding.left} y={height - 7}>{points[0].x.slice(5).replace('-', '/')}</SvgText>
        <SvgText fill={palette.muted} fontSize="10" textAnchor="end" x={width - padding.right} y={height - 7}>{points[points.length - 1].x.slice(5).replace('-', '/')}</SvgText>
      </Svg> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  empty: { fontSize: 13, paddingVertical: 35, textAlign: 'center' },
});
