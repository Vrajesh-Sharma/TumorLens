import { useState, useEffect } from 'react';
import apiClient from '../services/api';

/**
 * A custom hook to monitor connection status to the backend FastAPI server.
 * This checks the standard `/health` or root endpoint of the API.
 */
export function useHealthStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkHealth = async () => {
    try {
      setIsLoading(true);
      // Pinging the standard health check endpoint on the FastAPI server
      const response = await apiClient.get('/health');
      setIsConnected(response.status === 200);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    isConnected,
    isLoading,
    checkHealth,
  };
}
export default useHealthStatus;
