import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Goal, GoalTerm } from '../db/types';
import { getPalette } from '../theme';
import { ModalShell } from './ModalShell';

export function GoalFormModal({ visible, dark, term, goal, onClose, onSave, onDelete }: { visible: boolean; dark: boolean; term: GoalTerm; goal?: Goal; onClose: () => void; onSave: (description: string, date: string | null) => void; onDelete: () => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => { if (visible) { setDescription(goal?.description || ''); setDate(goal?.target_date || ''); } }, [goal, visible]);
  const save = () => { if (description.trim()) { onSave(description.trim(), date.trim() || null); onClose(); } };
  return (
    <ModalShell dark={dark} onClose={onClose} title={`${term === 'short' ? '短期' : term === 'medium' ? '中期' : '長期'}ゴール`} visible={visible}>
      <TextInput multiline onChangeText={setDescription} placeholder="ゴールを入力" placeholderTextColor={palette.muted} style={[styles.textarea, { backgroundColor: palette.input, color: palette.text }]} value={description} />
      <TextInput autoCapitalize="none" onChangeText={setDate} placeholder="目標日 (YYYY-MM-DD)" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={date} />
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={styles.saveText}>保存する</Text></Pressable>
      {goal ? <Pressable onPress={() => Alert.alert('ゴールを削除', 'このゴールを削除しますか？', [{ text: 'キャンセル' }, { text: '削除', style: 'destructive', onPress: () => { onDelete(); onClose(); } }])} style={styles.delete}><Text style={styles.deleteText}>ゴールを削除</Text></Pressable> : null}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  delete: { alignItems: 'center', padding: 14 },
  deleteText: { color: '#EF4444', fontWeight: '600' },
  input: { borderRadius: 12, fontSize: 15, marginBottom: 16, padding: 14 },
  save: { alignItems: 'center', borderRadius: 12, padding: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  textarea: { borderRadius: 12, fontSize: 16, height: 110, marginBottom: 16, padding: 14, textAlignVertical: 'top' },
});
