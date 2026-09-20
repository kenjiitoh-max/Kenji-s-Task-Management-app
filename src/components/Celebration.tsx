import ConfettiCannon from 'react-native-confetti-cannon';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Toast } from './Toast';

export function Celebration({ celebrationId, completeAll, toastMessage, toastVisible }: { celebrationId: number; completeAll: boolean; toastMessage: string; toastVisible: boolean }) {
  const confettiRef = useRef<ConfettiCannon>(null);
  useEffect(() => {
    if (celebrationId > 0) confettiRef.current?.start();
  }, [celebrationId]);
  return (
    <>
      <ConfettiCannon ref={confettiRef} autoStart={false} count={completeAll ? 250 : 80} origin={{ x: Dimensions.get('window').width / 2, y: Dimensions.get('window').height - 80 }} fadeOut={completeAll} />
      {completeAll && toastVisible ? <View pointerEvents="none" style={styles.overlay}><Text style={styles.overlayText}>今日のアクション全達成！🎉</Text></View> : null}
      <Toast message={toastMessage} visible={toastVisible} />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { alignItems: 'center', backgroundColor: '#00000022', bottom: 0, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 },
  overlayText: { backgroundColor: '#fff', borderRadius: 18, color: '#111827', fontSize: 20, fontWeight: '800', paddingHorizontal: 20, paddingVertical: 16 },
});
