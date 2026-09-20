import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { BodyRecord } from '../db/types';
import { localDate } from '../db/time';
import { getPalette, textOn } from '../theme';
import { isValidDate } from '../utils/date';
import { ModalShell } from './ModalShell';

export function BodyRecordModal({ visible, dark, record, onClose, onSave }: {
  visible: boolean;
  dark: boolean;
  record: BodyRecord | null;
  onClose: () => void;
  onSave: (date: string, weight: number, fat: number | null) => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [date, setDate] = useState(localDate());
  const [weight, setWeight] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (visible) {
      setDate(record?.date || localDate());
      setWeight(record ? String(record.weight_kg) : '');
      setFat(record?.body_fat_pct == null ? '' : String(record.body_fat_pct));
      setError('');
    }
  }, [record, visible]);
  const save = () => {
    const parsedWeight = Number(weight);
    const parsedFat = fat.trim() ? Number(fat) : null;
    if (!isValidDate(date.trim())) return setError('日付は有効なYYYY-MM-DD形式で入力してください。');
    if (!Number.isFinite(parsedWeight) || parsedWeight < 20 || parsedWeight > 300) return setError('体重は20〜300kgで入力してください。');
    if (parsedFat !== null && (!Number.isFinite(parsedFat) || parsedFat < 1 || parsedFat > 70)) return setError('体脂肪率は1〜70%で入力してください。');
    setError('');
    onSave(date.trim(), parsedWeight, parsedFat);
    onClose();
  };
  return (
    <ModalShell dark={dark} onClose={onClose} title="体重を記録" visible={visible}>
      <Text style={[styles.label, { color: palette.muted }]}>体重 (kg)</Text>
      <TextInput keyboardType="decimal-pad" onChangeText={(value) => { setWeight(value); setError(''); }} placeholder="例：62.4" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={weight} />
      <Text style={[styles.label, { color: palette.muted }]}>体脂肪率 (%)・任意</Text>
      <TextInput keyboardType="decimal-pad" onChangeText={(value) => { setFat(value); setError(''); }} placeholder="例：21.5" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={fat} />
      <Text style={[styles.label, { color: palette.muted }]}>日付</Text>
      <TextInput autoCapitalize="none" onChangeText={(value) => { setDate(value); setError(''); }} placeholder="YYYY-MM-DD" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={date} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={[styles.saveText, { color: textOn(palette.primary) }]}>保存する</Text></Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  error: { color: '#D95F59', fontSize: 13, marginBottom: 14 },
  input: { borderRadius: 14, fontSize: 16, marginBottom: 14, padding: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
  save: { alignItems: 'center', borderRadius: 14, padding: 15 },
  saveText: { fontSize: 16, fontWeight: '700' },
});
