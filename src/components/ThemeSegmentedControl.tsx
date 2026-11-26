import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { textOn } from '../contrast';
import { useTheme } from '../hooks/useTheme';
import { themeNames, type ThemeName } from '../theme';

const labels: Record<ThemeName, string> = {
  light: 'ライト',
  dark: 'ダーク',
  system: 'システム',
};

export function ThemeSegmentedControl() {
  const { theme, setTheme, palette } = useTheme();

  return (
    <View style={styles.row}>
      {themeNames.map((name) => {
        const selected = theme === name;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={name}
            onPress={() => setTheme(name)}
            style={[styles.segment, { backgroundColor: selected ? palette.primary : palette.input }]}
            testID={`theme-option-${name}`}
          >
            <Text style={[styles.label, { color: selected ? textOn(palette.primary, palette) : palette.text }]}>{labels[name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8 },
  segment: { alignItems: 'center', borderRadius: 12, flex: 1, paddingHorizontal: 10, paddingVertical: 12 },
});
