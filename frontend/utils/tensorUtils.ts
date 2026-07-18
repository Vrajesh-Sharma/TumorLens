import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { config } from '../config';

export interface PreprocessedInput {
  tensor: Float32Array;
  width: number;
  height: number;
  originalUri: string;
}

export async function preprocessImage(
  imageUri: string,
  _targetType: 'float32' | 'uint8' = 'float32'
): Promise<PreprocessedInput> {
  const inputSize = config.ai.inputSize;

  const resized = await manipulateAsync(
    imageUri,
    [{ resize: { width: inputSize.width, height: inputSize.height } }],
    { format: SaveFormat.JPEG, base64: true }
  );

  if (!resized.base64) {
    throw new Error('Failed to encode resized image as base64');
  }

  const binaryString = atob(resized.base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  let pixels: Uint8Array;
  let width: number;
  let height: number;

  try {
    const decoded = jpeg.decode(bytes, { useTArray: true });
    pixels = decoded.data;
    width = decoded.width;
    height = decoded.height;
  } catch (e) {
    throw new Error(`Failed to decode image: ${e}`);
  }

  const numPixels = width * height;

  // Step 1: Convert RGB to grayscale (luminosity method)
  // Model expects single-channel (FLAIR modality) grayscale input
  const gray = new Float32Array(numPixels);
  for (let i = 0; i < numPixels; i++) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Step 2: Percentile-based normalization (matches BraTS preprocessing)
  // Clip to 1st and 99th percentile, then min-max scale to [0, 1]
  const sorted = new Float32Array(gray).sort();
  const p1 = sorted[Math.floor(0.01 * numPixels)];
  const p99 = sorted[Math.floor(0.99 * numPixels)];
  const range = p99 - p1;

  const tensor = new Float32Array(numPixels);
  if (range > 1e-8) {
    for (let i = 0; i < numPixels; i++) {
      let val = gray[i];
      if (val < p1) val = p1;
      if (val > p99) val = p99;
      tensor[i] = (val - p1) / range;
    }
  } else {
    tensor.set(gray);
  }

  return { tensor, width, height, originalUri: imageUri };
}

export function tensorToArrayBuffer(tensor: Float32Array): ArrayBuffer {
  return tensor.buffer.slice(0) as ArrayBuffer;
}