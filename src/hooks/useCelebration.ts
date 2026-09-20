import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

const messages = ['よくできました！', 'ナイス！', '素晴らしい！', 'その一歩が未来を変える！'];

export function useCelebration() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [completeAll, setCompleteAll] = useState(false);
  const celebrate = useCallback(async (allComplete: boolean) => {
    setCompleteAll(allComplete);
    setToastMessage(allComplete ? '今日のアクション全達成！🎉' : messages[Math.floor(Math.random() * messages.length)]);
    setToastVisible(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setToastVisible(false), 1800);
  }, []);
  const uncomplete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);
  return { toastMessage, toastVisible, completeAll, celebrate, uncomplete };
}
