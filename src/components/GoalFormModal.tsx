import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Goal, GoalTerm } from '../db/types';
import { getPalette } from '../theme';
import { isValidDate } from '../utils/date';
import { ModalShell } from './ModalShell';

export function GoalFormModal({ visible, dark, term, goal, onClose, onSave, onDelete }: { visible: boolean; dark: boolean; term: GoalTerm; goal?: Goal; onClose: () => void; onSave: (description: string, date: string | null) => void; onDelete: () => void }) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [dateError, setDateError] = useState('');
  useEffect(() => { if (visible) { setDescription(goal?.description || ''); setDate(goal?.target_date || ''); setDateError(''); } }, [goal, visible]);
  const save = () => {
    const normalizedDate = date.trim();
    if (normalizedDate && !isValidDate(normalizedDate)) {
      setDateError('目標日は有効な日付をYYYY-MM-DD形式で入力してください。');
      return;
    }
    setDateError('');
    if (description.trim()) { onSave(description.trim(), normalizedDate || null); onClose(); }
  };
  return (
    <ModalShell dark={dark} onClose={onClose} title={`${term === 'short' ? '短期' : term === 'medium' ? '中期' : '長期'}ゴール`} visible={visible}>
      <TextInput multiline onChangeText={setDescription} placeholder="ゴールを入力" placeholderTextColor={palette.muted} style={[styles.textarea, { backgroundColor: palette.input, color: palette.text }]} value={description} />
      <TextInput autoCapitalize="none" onChangeText={(value) => { setDate(value); setDateError(''); }} placeholder="目標日 (YYYY-MM-DD)" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={date} />
      {dateError ? <Text style={[styles.error, { color: '#EF4444' }]}>{dateError}</Text> : null}
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={styles.saveText}>保存する</Text></Pressable>
      {goal ? <Pressable onPress={() => Alert.alert('ゴールを削除', 'このゴールを削除しますか？', [{ text: 'キャンセル' }, { text: '削除', style: 'destructive', onPress: () => { onDelete(); onClose(); } }])} style={styles.delete}><Text style={styles.deleteText}>ゴールを削除</Text></Pressable> : null}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  delete: { alignItems: 'center', padding: 14 },
  deleteText: { color: '#EF4444', fontWeight: '600' },
  error: { fontSize: 13, marginBottom: 16, marginTop: -8 },
  input: { borderRadius: 12, fontSize: 15, marginBottom: 16, padding: 14 },
  save: { alignItems: 'center', borderRadius: 12, padding: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  textarea: { borderRadius: 12, fontSize: 16, height: 110, marginBottom: 16, padding: 14, textAlignVertical: 'top' },
});
