import { useState, useRef, useCallback } from 'react';
import { PredictionResponse, PredictionStatusType } from '../types/prediction';
import { predictionService } from '../services/predictionService';
import { SegmentationResponse } from '../types';
import { aiService, AIProgress } from '../services/aiService';

export function usePrediction() {
  const [status, setStatus] = useState<PredictionStatusType>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PredictionResponse | null>(null);

  const cancelRef = useRef(false);

  /**
   * Runs local TFLite inference on the selected MRI image.
   */
  const startPrediction = useCallback(async (imageUri: string): Promise<PredictionResponse | null> => {
    setStatus('loading');
    setProgress(0);
    setError(null);
    setData(null);
    cancelRef.current = false;

    try {
      const onProgress = (aiProgress: AIProgress) => {
        setProgress(aiProgress.progress);
      };

      const segmentation: SegmentationResponse = await aiService.analyze(
        { imageUri },
        onProgress
      );

      const counts = segmentation.perClassCounts || {
        background: 0,
        necrotic_core: 0,
        edema: 0,
        enhancing_tumor: 0,
      };

      const mappedResponse: PredictionResponse = {
        overlay_image: segmentation.overlayImageUri,
        raw_mask: segmentation.maskImageUri,
        stats: {
          tumor_area: segmentation.tumorAreaMm2 || 0,
          per_class_counts: { ...counts },
          inference_time: undefined,
          timestamp: new Date().toISOString(),
        },
        tumor_area: segmentation.tumorAreaMm2 || 0,
        per_class_counts: { ...counts },
        detection_flag: segmentation.tumorDetected,
        confidence: segmentation.predictionScore,
      };

      predictionService.setLastPrediction(mappedResponse);

      setData(mappedResponse);
      setStatus('success');
      return mappedResponse;
    } catch (err: any) {
      if (cancelRef.current || err.message?.includes('canceled')) {
        setStatus('idle');
        setError('Analysis aborted by clinician.');
        cancelRef.current = false;
      } else {
        setStatus('error');
        let errorMessage = err.message || 'AI inference failed. Please try again.';
        if (errorMessage.includes('Model not loaded')) {
          errorMessage = 'AI model failed to load. Restart the app or check model file integrity.';
        } else if (errorMessage.includes('preprocessing failed')) {
          errorMessage = 'Image could not be processed. Ensure the scan is a valid MRI image (PNG/JPEG).';
        } else if (errorMessage.includes('TFLite inference failed')) {
          errorMessage = 'Model inference error. The scan may contain unexpected data.';
        }
        setError(errorMessage);
      }
      return null;
    }
  }, []);

  const cancelPrediction = useCallback(() => {
    cancelRef.current = true;
    aiService.cancelAnalysis();
  }, []);

  const resetPrediction = useCallback(() => {
    cancelRef.current = false;
    setStatus('idle');
    setProgress(0);
    setError(null);
    setData(null);
  }, []);

  return {
    status,
    progress,
    error,
    data,
    startPrediction,
    cancelPrediction,
    resetPrediction,
  };
}

export default usePrediction;
