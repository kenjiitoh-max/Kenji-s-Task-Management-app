import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

export function Fab({ onPress, color }: { onPress: () => void; color: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="追加" onPress={onPress} style={[styles.fab, { backgroundColor: color }]}>
      <Ionicons name="add" size={30} color="#fff" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    borderRadius: 30,
    bottom: 24,
    elevation: 5,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: '#6D5C7A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    width: 60,
  },
});
