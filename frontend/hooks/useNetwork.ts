import { useState, useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useAppStore } from '../store/appStore';

export interface NetworkStatus {
  isConnected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
  isWeakConnection: boolean;
  details: string;
}

export function useNetwork() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    connectionType: 'unknown',
    isWeakConnection: false,
    details: 'Initializing network state listener...'
  });
  const setOnline = useAppStore((s) => s.setOnline);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = !!state.isConnected;
      const type = state.type;
      
      let connectionType: NetworkStatus['connectionType'] = 'unknown';
      if (type === 'none') connectionType = 'none';
      else if (type === 'wifi') connectionType = 'wifi';
      else if (type === 'cellular') connectionType = 'cellular';

      let isWeakConnection = false;
      let details = 'Stable network connection active.';

      if (isConnected) {
        if (type === 'cellular') {
          const detailsCellular = state.details as any;
          const generation = detailsCellular?.cellularGeneration;
          if (generation === '2g' || generation === '3g') {
            isWeakConnection = true;
            details = 'Weak connection (3G/2G) detected. Sync operations may be throttled.';
          } else {
            details = `Mobile Data (${generation ? generation.toUpperCase() : 'LTE'}) connection active.`;
          }
        } else if (type === 'wifi') {
          details = 'High-speed Wi-Fi connection active.';
        }
      } else {
        details = 'Local workstation offline. Diagnostics will queue locally.';
      }

      setOnline(isConnected && !isWeakConnection);
      wasOffline.current = !isConnected;
      setStatus({
        isConnected,
        connectionType,
        isWeakConnection,
        details
      });
    });

    return () => unsubscribe();
  }, [setOnline]);

  return status;
}

export default useNetwork;
