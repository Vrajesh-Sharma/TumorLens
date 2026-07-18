import { useState, useCallback, useRef } from 'react';
import type { NotificationConfig } from '../components/notifications/ResultNotificationCard';

export function useNotificationPopUp() {
  const [currentNotification, setCurrentNotification] = useState<NotificationConfig | null>(null);
  const queueRef = useRef<NotificationConfig[]>([]);

  const show = useCallback((config: NotificationConfig) => {
    if (currentNotification) {
      queueRef.current.push(config);
      return;
    }
    setCurrentNotification(config);
  }, [currentNotification]);

  const dismiss = useCallback(() => {
    setCurrentNotification(null);
    const next = queueRef.current.shift();
    if (next) {
      setCurrentNotification(next);
    }
  }, []);

  return {
    currentNotification,
    show,
    dismiss,
  };
}

export default useNotificationPopUp;
