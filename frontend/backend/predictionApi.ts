import apiClient from '../services/api';
import { PredictionResponse } from '../types/prediction';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * Uploads a structural brain MRI slice to the FastAPI backend /predict endpoint.
 * Accepts progress updates and cancellation signals.
 */
export async function uploadMriForPrediction(
  imageUri: string,
  options?: UploadOptions
): Promise<PredictionResponse> {
  const formData = new FormData();

  const fileName = imageUri.split('/').pop() || 'mri_scan.jpg';
  const fileExt = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

  // React Native Multipart FormData file structure
  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await apiClient.post<PredictionResponse>('/predict', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (options?.onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        options.onProgress(percentCompleted);
      }
    },
    signal: options?.signal,
  });

  return response.data;
}
