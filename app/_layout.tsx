import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';
import { getDb, initDatabase, seedCategories } from '../src/db/database';
import { ensureDailyReset } from '../src/db/dailyActions';
import { emit } from '../src/db/dailyResetEvents';
import { getThemePreference, setThemePreference } from '../src/db/settings';
import { localDate } from '../src/db/time';
import { ThemeProvider, useTheme } from '../src/hooks/useTheme';
import type { ThemeName } from '../src/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<ThemeName>('dark');
  useEffect(() => {
    const db = getDb();
    initDatabase(db);
    seedCategories(db);
    ensureDailyReset(db);
    setTheme(getThemePreference(db));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && ensureDailyReset(getDb())) emit();
    });
    let midnightTimer: ReturnType<typeof setTimeout>;
    const scheduleMidnightReset = () => {
      const nextMidnight = new Date();
      nextMidnight.setHours(24, 0, 1, 0);
      midnightTimer = setTimeout(() => {
        if (ensureDailyReset(getDb(), localDate())) emit();
        scheduleMidnightReset();
      }, Math.max(1, nextMidnight.getTime() - Date.now()));
    };
    scheduleMidnightReset();
    setReady(true);
    return () => {
      subscription.remove();
      clearTimeout(midnightTimer);
    };
  }, []);
  if (!ready) return <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <ThemeProvider initialTheme={theme} onThemeChange={(nextTheme) => setThemePreference(getDb(), nextTheme)}><ThemedLayout /></ThemeProvider>;
}

function ThemedLayout() {
  const { dark, palette } = useTheme();
  return <><StatusBar style={dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }} /></>;
}
