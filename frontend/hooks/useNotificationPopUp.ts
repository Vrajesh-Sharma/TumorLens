import { useState, useCallback, useRef } from 'react';
import type { NotificationConfig } from '../components/notifications/ResultNotificationCard';

export function useNotificationPopUp() {
  const [currentNotification, setCurrentNotification] = useState<NotificationConfig | null>(null);
  const queueRef = useRef<NotificationConfig[]>([]);
  const activeRef = useRef(false);

  const show = useCallback((config: NotificationConfig) => {
    if (activeRef.current) {
      queueRef.current.push(config);
      return;
    }
    activeRef.current = true;
    setCurrentNotification(config);
  }, []);

  const dismiss = useCallback(() => {
    setCurrentNotification(null);
    activeRef.current = false;
    const next = queueRef.current.shift();
    if (next) {
      activeRef.current = true;
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
