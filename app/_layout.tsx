import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, useColorScheme, View } from 'react-native';
import { getDb, initDatabase, seedCategories } from '../src/db/database';
import { ensureDailyReset } from '../src/db/dailyActions';
import { emit } from '../src/db/dailyResetEvents';
import { localDate } from '../src/db/time';
import { getPalette } from '../src/theme';

export default function RootLayout() {
  const scheme = useColorScheme();
  const palette = getPalette(scheme);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const db = getDb();
    initDatabase(db);
    seedCategories(db);
    ensureDailyReset(db);
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
  if (!ready) return <View style={{ alignItems: 'center', backgroundColor: palette.background, flex: 1, justifyContent: 'center' }}><ActivityIndicator color={palette.primary} /></View>;
  return <><StatusBar style={scheme === 'light' ? 'dark' : 'light'} /><Stack screenOptions={{ contentStyle: { backgroundColor: palette.background }, headerShown: false }} /></>;
}
