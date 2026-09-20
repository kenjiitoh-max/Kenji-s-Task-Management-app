import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getPalette, pastelColors } from '../theme';
import { ModalShell } from './ModalShell';

export function CategoryFormModal({ visible, dark, onClose, onSave }: { visible: boolean; dark: boolean; onClose: () => void; onSave: (name: string, color: string) => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [name, setName] = useState('');
  const [color, setColor] = useState(pastelColors[0]);
  const save = () => { if (name.trim()) { onSave(name.trim(), color); setName(''); onClose(); } };
  return (
    <ModalShell dark={dark} onClose={onClose} title="カテゴリーを追加" visible={visible}>
      <TextInput autoFocus onChangeText={setName} placeholder="カテゴリー名" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={name} />
      <Text style={[styles.label, { color: palette.muted }]}>アクセントカラー</Text>
      <View style={styles.colors}>{pastelColors.map((item) => <Pressable key={item} onPress={() => setColor(item)} style={[styles.color, { backgroundColor: item }, color === item && styles.selected]} />)}</View>
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={styles.saveText}>追加する</Text></Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  color: { borderRadius: 20, height: 34, marginRight: 12, width: 34 },
  colors: { flexDirection: 'row', marginBottom: 24 },
  input: { borderRadius: 12, fontSize: 16, marginBottom: 20, padding: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  save: { alignItems: 'center', borderRadius: 12, padding: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  selected: { borderColor: '#fff', borderWidth: 3, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4 },
});
