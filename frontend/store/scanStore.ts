import { create } from 'zustand';
import { SegmentationResponse } from '../types';

interface ScanState {
  currentScan: SegmentationResponse | null;
  scans: SegmentationResponse[];
  setCurrentScan: (scan: SegmentationResponse | null) => void;
  addScan: (scan: SegmentationResponse) => void;
  clearScans: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  currentScan: null,
  scans: [],
  setCurrentScan: (currentScan) => set({ currentScan }),
  addScan: (scan) =>
    set((state) => ({ scans: [scan, ...state.scans] })),
  clearScans: () => set({ scans: [], currentScan: null }),
}));
