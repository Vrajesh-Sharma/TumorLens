export interface PatientInfo {
  id?: string;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
}

export interface SegmentationRequest {
  imageUri: string;
  patient?: PatientInfo;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SegmentationResponse {
  id: string;
  originalImageUri: string;
  maskImageUri: string;         // Binary mask URI/Base64 (white tumor on black background)
  overlayImageUri: string;      // Semi-transparent overlay URI/Base64 (red tumor on transparent)
  predictionScore: number;      // Confidence from softmax output (e.g., 0.985 for 98.5%)
  tumorDetected: boolean;
  tumorAreaPx?: number;         // Area of tumor in pixels
  tumorAreaMm2?: number;        // Estimated area in mm² if scanner scaling is available
  boundingBox?: BoundingBox;    // Bounding box coordinates around the tumor
  perClassCounts?: { background: number; necrotic_core: number; edema: number; enhancing_tumor: number };
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type AsyncState<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type UserRole = 'doctor' | 'radiologist';
