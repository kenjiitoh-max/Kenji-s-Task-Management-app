import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

const messages = ['よくできました！', 'ナイス！', '素晴らしい！', 'その一歩が未来を変える！'];

export function useCelebration() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [completeAll, setCompleteAll] = useState(false);
  const [big, setBig] = useState(false);
  const [celebrationId, setCelebrationId] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);
  const celebrate = useCallback((allComplete: boolean, message?: string, bigConfetti = false) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setCompleteAll(allComplete);
    setBig(bigConfetti);
    setCelebrationId((id) => id + 1);
    setToastMessage(allComplete ? '今日のアクション全達成！🎉' : message || messages[Math.floor(Math.random() * messages.length)]);
    setToastVisible(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    hideTimer.current = setTimeout(() => {
      setToastVisible(false);
      hideTimer.current = null;
    }, 1800);
  }, []);
  const uncomplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);
  return { toastMessage, toastVisible, completeAll, big, celebrationId, celebrate, uncomplete };
}
