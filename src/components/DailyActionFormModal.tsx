import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { getPalette } from '../theme';
import { ModalShell } from './ModalShell';

export function DailyActionFormModal({ visible, dark, onClose, onSave }: { visible: boolean; dark: boolean; onClose: () => void; onSave: (title: string) => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [title, setTitle] = useState('');
  const save = () => { if (title.trim()) { onSave(title.trim()); setTitle(''); onClose(); } };
  return (
    <ModalShell dark={dark} onClose={onClose} title="デイリーアクションを追加" visible={visible}>
      <TextInput autoFocus onChangeText={setTitle} onSubmitEditing={save} placeholder="例：朝に10分読書する" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={title} />
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={styles.saveText}>追加する</Text></Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  input: { borderRadius: 12, fontSize: 16, marginBottom: 18, padding: 14 },
  save: { alignItems: 'center', borderRadius: 12, padding: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
