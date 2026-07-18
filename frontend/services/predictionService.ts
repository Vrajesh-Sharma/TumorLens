import { PredictionResponse, MedicalReport, PerClassCounts } from '../types/prediction';

const predictionCache = new Map<string, PredictionResponse>();
let lastActivePrediction: PredictionResponse | null = null;

export const predictionService = {
  async predictMri(
    imageUri: string,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<PredictionResponse> {
    if (predictionCache.has(imageUri)) {
      const cachedResponse = predictionCache.get(imageUri)!;
      lastActivePrediction = cachedResponse;
      onProgress?.(100);
      return cachedResponse;
    }

    const { aiService } = await import('./aiService');

    const onAIProgress = (aiProgress: any) => {
      if (aiProgress.progress !== undefined && onProgress) {
        onProgress(aiProgress.progress);
      }
    };

    const segmentation = await aiService.analyze(
      { imageUri },
      onAIProgress
    );

    const counts = segmentation.perClassCounts || {
      background: 0,
      necrotic_core: 0,
      edema: 0,
      enhancing_tumor: 0,
    };

    const response: PredictionResponse = {
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

    predictionCache.set(imageUri, response);
    lastActivePrediction = response;
    return response;
  },

  getLastPrediction(): PredictionResponse | null {
    return lastActivePrediction;
  },

  setLastPrediction(prediction: PredictionResponse | null) {
    lastActivePrediction = prediction;
  },

  clearCache() {
    predictionCache.clear();
    lastActivePrediction = null;
  },
};

export const reportFormatter = {
  generateReport(response: PredictionResponse): MedicalReport {
    const counts = response.per_class_counts || {};
    const tumorDetected = response.detection_flag;
    const overallArea = response.tumor_area || 0;

    let dominantRegion = 'N/A (Clear)';
    if (tumorDetected) {
      const regions = [
        { name: 'Peritumoral Edema (ED)', count: counts.edema || 0 },
        { name: 'Necrotic Core (NCR)', count: counts.necrotic_core || 0 },
        { name: 'Enhancing Tumor (ET)', count: counts.enhancing_tumor || 0 },
      ];

      const sorted = regions.sort((a, b) => b.count - a.count);
      if (sorted[0].count > 0) {
        dominantRegion = sorted[0].name;
      } else {
        dominantRegion = 'Diffuse Classifications';
      }
    }

    const confidence = response.confidence !== undefined
      ? response.confidence
      : 0;

    return {
      tumorDetected,
      overallTumorArea: parseFloat(overallArea.toFixed(2)),
      dominantRegion,
      confidence,
      modelUsed: 'BraTS2020 U-Net (TFLite)',
      analysisDate: new Date().toISOString(),
      disclaimer: 'This U-Net report is an automated neural network recommendation. Prior to surgical planning, a licensed radiologist must confirm findings.'
    };
  },
};

export default {
  predictionService,
  reportFormatter,
};
