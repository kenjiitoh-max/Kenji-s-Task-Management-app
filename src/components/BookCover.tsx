import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export function BookCover({ url, title, width = 64, dark }: { url: string | null; title: string; width?: number; dark: boolean }) {
  const height = Math.round(width * 1.45);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (url && !failed) {
    return <Image accessibilityLabel={`${title} の表紙`} onError={() => setFailed(true)} source={{ uri: url }} style={[styles.cover, { height, width }]} />;
  }
  return (
    <View style={[styles.cover, styles.placeholder, { backgroundColor: dark ? '#3D2E56' : '#E8DFF4', height, width }]}>
      <Text numberOfLines={4} style={[styles.placeholderText, { color: dark ? '#F6F0FB' : '#2B1B45', fontSize: Math.max(9, width / 7) }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { borderRadius: 6 },
  placeholder: { alignItems: 'center', justifyContent: 'center', padding: 4 },
  placeholderText: { fontWeight: '700', textAlign: 'center' },
});
