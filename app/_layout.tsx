import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, useColorScheme, View } from 'react-native';
import { getDb, initDatabase, seedCategories } from '../src/db/database';
import { ensureDailyReset } from '../src/db/dailyActions';

export default function RootLayout() {
  const scheme = useColorScheme();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const db = getDb();
    initDatabase(db);
    seedCategories(db);
    ensureDailyReset(db);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') ensureDailyReset(getDb());
    });
    setReady(true);
    return () => subscription.remove();
  }, []);
  if (!ready) return <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  return <><StatusBar style={scheme === 'dark' ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false }} /></>;
}
