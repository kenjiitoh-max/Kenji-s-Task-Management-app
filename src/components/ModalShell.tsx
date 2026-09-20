import React, { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getPalette } from '../theme';

export function ModalShell({ visible, title, dark, onClose, children }: PropsWithChildren<{ visible: boolean; title: string; dark: boolean; onClose: () => void }>) {
  const palette = getPalette(dark ? 'dark' : 'light');
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { backgroundColor: palette.card }]}>
          <View style={styles.header}><Text style={[styles.title, { color: palette.text }]}>{title}</Text><Pressable onPress={onClose}><Text style={[styles.cancel, { color: palette.primary }]}>閉じる</Text></Pressable></View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#00000055', flex: 1, justifyContent: 'flex-end' },
  cancel: { fontSize: 14, fontWeight: '600' },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '800' },
});
