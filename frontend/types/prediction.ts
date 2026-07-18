export interface PerClassCounts {
  background: number;
  necrotic_core: number;
  edema: number;
  enhancing_tumor: number;
  [key: string]: number; // Allow dynamic key indexing
}

export interface TumorStats {
  tumor_area: number;
  per_class_counts: PerClassCounts;
  inference_time?: number;
  timestamp?: string;
}

export interface PredictionResponse {
  overlay_image: string; // Base64 string or image URL
  raw_mask: string;      // Base64 string or mask URL
  stats: TumorStats | any;
  tumor_area: number;
  per_class_counts: PerClassCounts;
  detection_flag: boolean;
  confidence?: number;   // Mean softmax confidence from model output
}

export type PredictionStatusType = 'idle' | 'loading' | 'success' | 'error';

export interface MedicalReport {
  tumorDetected: boolean;
  overallTumorArea: number; // percentage
  dominantRegion: string;
  confidence: number;
  modelUsed: string;
  analysisDate: string;
  disclaimer: string;
}

export interface ImageMetadata {
  name: string;
  width: number;
  height: number;
  size: string;
  type: string;
}
