import { TumorStats } from './prediction';

/**
 * Report Schema for Local Clinical Reports
 */
export interface Report {
  id: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female' | 'other';
  originalImageUri: string;
  overlayImageUri: string;
  tumorStats: TumorStats;
  tumorDetected: boolean;
  timestamp: string; // ISO date-time string
  favorite: boolean;
  notes?: string;
  modelUsed?: string;
  
  // Sync details for offline-first replication
  syncStatus?: 'synced' | 'pending' | 'uploading' | 'failed';
  cloudId?: string;
  updatedAt?: string;
  conflictVersion?: number;
}

export interface ReportStatistics {
  totalCount: number;
  tumorDetectedCount: number;
  healthyCount: number;
  favoriteCount: number;
  averageTumorArea: number; // percentage
}
