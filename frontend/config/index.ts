import { modelPath } from './modelPath';

export const config = {
  app: {
    name: 'TumorLens',
    version: '1.0.0',
    scheme: 'tumorlens',
  },
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000',
    timeout: 30000,
    retryCount: 3,
  },
  ai: {
    modelName: 'Attention U-Net (FLAIR)',
    modelVersion: '1.0.0',
    modelPath,
    inputSize: { width: 256, height: 256 },
    inputChannels: 1,
    confidenceThreshold: 0.5,
    delegates: [] as ('metal' | 'core-ml' | 'nnapi' | 'android-gpu')[],
    numThreads: 4,
  },
  storage: {
    maxCacheSize: 50 * 1024 * 1024,
    imageQuality: 0.85,
  },
  sync: {
    retryDelay: 5000,
    maxRetries: 5,
  },
};

export default config;
