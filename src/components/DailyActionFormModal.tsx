import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionTemplate } from '../db/types';
import { getPalette, radius, textOn } from '../theme';
import { ModalShell } from './ModalShell';

export function DailyActionFormModal({ visible, dark, accent, templates, onClose, onSave, onApplyTemplate, onSaveTemplate, onDeleteTemplate }: {
  visible: boolean;
  dark: boolean;
  accent: string;
  templates: ActionTemplate[];
  onClose: () => void;
  onSave: (title: string) => void;
  onApplyTemplate: (template: ActionTemplate) => void;
  onSaveTemplate: (title: string) => void;
  onDeleteTemplate: (template: ActionTemplate) => void;
}) {
  const palette = getPalette(dark ? 'dark' : 'light');
  const [title, setTitle] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const save = () => {
    if (title.trim()) {
      onSave(title.trim());
      if (saveAsTemplate) onSaveTemplate(title.trim());
      setTitle('');
      setSaveAsTemplate(false);
      onClose();
    }
  };
  const confirmDelete = (template: ActionTemplate) => {
    Alert.alert('テンプレートを削除', `「${template.title}」をテンプレートから削除しますか？`, [
      { text: 'キャンセル' },
      { text: '削除', style: 'destructive', onPress: () => onDeleteTemplate(template) },
    ]);
  };
  return (
    <ModalShell dark={dark} onClose={onClose} title="デイリーアクションを追加" visible={visible}>
      {templates.length > 0 ? (
        <View style={styles.templateSection}>
          <Text style={[styles.templateLabel, { color: palette.muted }]}>テンプレートからワンタップ追加</Text>
          <View style={styles.chips}>
            {templates.map((template) => (
              <Pressable
                accessibilityLabel={`テンプレート ${template.title}`}
                key={template.id}
                onLongPress={() => confirmDelete(template)}
                onPress={() => { onApplyTemplate(template); onClose(); }}
                style={[styles.chip, { backgroundColor: `${accent}22` }]}
              >
                <Text style={[styles.chipText, { color: palette.text }]}>{template.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <TextInput autoFocus onChangeText={setTitle} onSubmitEditing={save} placeholder="例：朝に10分読書する" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.input, color: palette.text }]} value={title} />
      <Pressable onPress={() => setSaveAsTemplate((value) => !value)} style={styles.templateToggle}>
        <Ionicons color={saveAsTemplate ? accent : palette.muted} name={saveAsTemplate ? 'bookmark' : 'bookmark-outline'} size={18} />
        <Text style={[styles.templateToggleText, { color: palette.muted }]}>テンプレートにも保存する</Text>
      </Pressable>
      <Pressable onPress={save} style={[styles.save, { backgroundColor: palette.primary }]}><Text style={[styles.saveText, { color: textOn(palette.primary) }]}>追加する</Text></Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  chip: { borderRadius: radius.control, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  input: { borderRadius: 12, fontSize: 16, marginBottom: 12, padding: 14 },
  save: { alignItems: 'center', borderRadius: 12, padding: 15 },
  saveText: { fontSize: 16, fontWeight: '700' },
  templateLabel: { fontSize: 12 },
  templateSection: { marginBottom: 14 },
  templateToggle: { alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: 18 },
  templateToggleText: { fontSize: 14 },
});
