import { SegmentationRequest, SegmentationResponse } from '../types';
import { config } from '../config';
import { preprocessImage, tensorToArrayBuffer } from '../utils/tensorUtils';
import { parseOutputTensor, parseOutputTensorUint8 } from '../utils/maskUtils';
import type { TensorDataType } from 'react-native-fast-tflite';

export interface ModelTensorInfo {
  name: string;
  dataType: TensorDataType;
  shape: number[];
}

export interface ModelInfo {
  name: string;
  version: string;
  inputSize: { width: number; height: number };
  supportedFormats: string[];
  isLoaded: boolean;
  inputTensors?: ModelTensorInfo[];
  outputTensors?: ModelTensorInfo[];
}

export type AnalysisStatus = 'idle' | 'preprocessing' | 'inference' | 'postprocessing' | 'complete' | 'error';

export interface AIProgress {
  status: AnalysisStatus;
  progress: number;
  message?: string;
}

export interface AIService {
  readonly modelInfo: ModelInfo;
  loadModel(): Promise<boolean>;
  isModelLoaded(): boolean;
  analyze(request: SegmentationRequest, onProgress?: (progress: AIProgress) => void): Promise<SegmentationResponse>;
  cancelAnalysis(): void;
  unloadModel(): Promise<void>;
}

let tfliteModel: any = null;
let cancelRequested = false;
let detectedInputType: TensorDataType | null = null;
let detectedOutputType: TensorDataType | null = null;
let detectedInputShape: number[] | null = null;
let detectedOutputShape: number[] | null = null;

const MODEL_SOURCE = config.ai.modelPath;
const INPUT_SIZE = config.ai.inputSize;

export const aiService: AIService = {
  modelInfo: {
    name: config.ai.modelName,
    version: config.ai.modelVersion,
    inputSize: { width: INPUT_SIZE.width, height: INPUT_SIZE.height },
    supportedFormats: ['png', 'jpeg', 'jpg'],
    isLoaded: false,
  },

  async loadModel(): Promise<boolean> {
    if (tfliteModel) return true;
    cancelRequested = false;

    try {
      const { loadTensorflowModel } = require('react-native-fast-tflite');
      tfliteModel = await loadTensorflowModel(MODEL_SOURCE, config.ai.delegates);

      detectedInputType = tfliteModel.inputs?.[0]?.dataType ?? null;
      detectedOutputType = tfliteModel.outputs?.[0]?.dataType ?? null;
      detectedInputShape = tfliteModel.inputs?.[0]?.shape ?? null;
      detectedOutputShape = tfliteModel.outputs?.[0]?.shape ?? null;

      this.modelInfo.inputTensors = tfliteModel.inputs
        ? tfliteModel.inputs.map((t: any) => ({ name: t.name, dataType: t.dataType, shape: t.shape }))
        : undefined;
      this.modelInfo.outputTensors = tfliteModel.outputs
        ? tfliteModel.outputs.map((t: any) => ({ name: t.name, dataType: t.dataType, shape: t.shape }))
        : undefined;

      console.log('[AIService] Model loaded successfully');
      console.log('[AIService] Model input tensors:', JSON.stringify(this.modelInfo.inputTensors));
      console.log('[AIService] Model output tensors:', JSON.stringify(this.modelInfo.outputTensors));

      if (detectedInputShape && detectedInputShape.length >= 3) {
        const isNHWC = detectedInputShape.length === 4;
        const hIndex = isNHWC ? 1 : 0;
        const wIndex = isNHWC ? 2 : 1;
        const h = detectedInputShape[hIndex];
        const w = detectedInputShape[wIndex];
        if (h && w && h !== INPUT_SIZE.height) {
          console.warn(`[AIService] Model input height ${h} differs from config ${INPUT_SIZE.height}`);
        }
        if (w && w !== INPUT_SIZE.width) {
          console.warn(`[AIService] Model input width ${w} differs from config ${INPUT_SIZE.width}`);
        }
      }

      this.modelInfo.isLoaded = true;
      return true;
    } catch (err) {
      console.error('[AIService] Failed to load TFLite model:', err);
      this.modelInfo.isLoaded = false;
      return false;
    }
  },

  isModelLoaded(): boolean {
    return this.modelInfo.isLoaded && tfliteModel !== null;
  },

  async analyze(
    request: SegmentationRequest,
    onProgress?: (progress: AIProgress) => void
  ): Promise<SegmentationResponse> {
    cancelRequested = false;

    if (!tfliteModel) {
      const loaded = await this.loadModel();
      if (!loaded) {
        throw new Error('Model not loaded. Call loadModel() first or check the model file.');
      }
    }

    const emitProgress = (status: AnalysisStatus, progress: number, message?: string) => {
      onProgress?.({ status, progress, message });
    };

    emitProgress('preprocessing', 10, 'Preprocessing image slices...');
    if (cancelRequested) throw new Error('Analysis canceled by user');

    let preprocessed;
    try {
      const targetInputType = detectedInputType === 'uint8' ? 'uint8' : 'float32';
      preprocessed = await preprocessImage(request.imageUri, targetInputType);
    } catch (err) {
      throw new Error(`Image preprocessing failed: ${err}`);
    }

    emitProgress('preprocessing', 30, 'Normalizing pixel intensities...');
    if (cancelRequested) throw new Error('Analysis canceled by user');

    emitProgress('inference', 40, 'Running Attention U-Net inference...');
    if (cancelRequested) throw new Error('Analysis canceled by user');

    const inputBuffer = tensorToArrayBuffer(preprocessed.tensor);

    let outputBuffers: ArrayBuffer[];
    try {
      outputBuffers = await tfliteModel.run([inputBuffer]);
    } catch (err) {
      this.modelInfo.isLoaded = false;
      tfliteModel = null;
      throw new Error(`TFLite inference failed: ${err}`);
    }

    if (cancelRequested) throw new Error('Analysis canceled by user');

    emitProgress('postprocessing', 70, 'Thresholding probability map...');
    if (cancelRequested) throw new Error('Analysis canceled by user');

    const outputBuffer = outputBuffers[0];
    const shapeLen = detectedInputShape?.length ?? 0;
    const isNHWC = shapeLen === 4;
    const width = detectedInputShape?.[isNHWC ? 2 : 1] ?? INPUT_SIZE.width;
    const height = detectedInputShape?.[isNHWC ? 1 : 0] ?? INPUT_SIZE.height;

    let result;
    if (detectedOutputType === 'uint8') {
      result = parseOutputTensorUint8(outputBuffer, width, height);
    } else {
      result = parseOutputTensor(outputBuffer, width, height);
    }

    emitProgress('postprocessing', 85, 'Calculating volumetric statistics...');
    if (cancelRequested) throw new Error('Analysis canceled by user');

    const scanId = `scan_${Date.now()}`;

    emitProgress('complete', 100, 'Analysis complete');

    return {
      id: scanId,
      originalImageUri: request.imageUri,
      maskImageUri: result.maskBase64,
      predictionScore: result.confidence,
      tumorDetected: result.tumorDetected,
      tumorAreaMm2: result.tumorArea,
      perClassCounts: result.perClassCounts,
      createdAt: new Date().toISOString(),
    };
  },

  cancelAnalysis(): void {
    cancelRequested = true;
  },

  async unloadModel(): Promise<void> {
    if (tfliteModel) {
      try {
        tfliteModel = null;
        this.modelInfo.isLoaded = false;
      } catch (err) {
        console.error('[AIService] Failed to unload model:', err);
      }
    }
  },
};

export default aiService;