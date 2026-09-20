import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BodyProfile, Sex } from '../db/types';
import { getPalette } from '../theme';
import { ModalShell } from './ModalShell';

export function BodyProfileModal({ visible, dark, profile, onClose, onSave }: {
  visible: boolean;
  dark: boolean;
  profile: BodyProfile;
  onClose: () => void;
  onSave: (height: number, sex: Sex) => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [error, setError] = useState('');
  useEffect(() => {
    if (visible) {
      setHeight(profile.height_cm == null ? '' : String(profile.height_cm));
      setSex(profile.sex);
      setError('');
    }
  }, [profile, visible]);
  const save = () => {
    const value = Number(height);
    if (!Number.isFinite(value) || value < 100 || value > 250) return setError('身長は100〜250cmで入力してください。');
    onSave(value, sex);
    onClose();
  };
  return (
    <ModalShell dark={dark} onClose={onClose} title="プロフィール設定" visible={visible}>
      <Text style={[styles.label, { color: palette.muted }]}>身長 (cm)</Text>
      <TextInput keyboardType="decimal-pad" onChangeText={(value) => { setHeight(value); setError(''); }} placeholder="例：170" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={height} />
      <Text style={[styles.label, { color: palette.muted }]}>性別</Text>
      <View style={[styles.segment, { backgroundColor: palette.input }]}>
        {([['male', '男性'], ['female', '女性']] as const).map(([value, label]) => <Pressable key={value} onPress={() => setSex(value)} style={[styles.segmentButton, sex === value && { backgroundColor: palette.card }]}><Text style={{ color: sex === value ? palette.text : palette.muted, fontWeight: '700' }}>{label}</Text></Pressable>)}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={styles.saveText}>保存する</Text></Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  error: { color: '#D95F59', fontSize: 13, marginBottom: 14 },
  input: { borderRadius: 14, fontSize: 16, marginBottom: 18, padding: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
  save: { alignItems: 'center', borderRadius: 14, padding: 15 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  segment: { borderRadius: 14, flexDirection: 'row', marginBottom: 20, padding: 4 },
  segmentButton: { alignItems: 'center', borderRadius: 11, flex: 1, padding: 11 },
});
