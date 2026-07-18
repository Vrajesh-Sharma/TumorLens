import { PerClassCounts, TumorStats } from '../types/prediction';
import { config } from '../config';

const TUMOR_COLOR: [number, number, number, number] = [255, 0, 0, 180];

type MaskRenderMode = 'overlay' | 'binary';

export interface SegmentationResult {
  maskBase64: string;
  overlayBase64: string;
  perClassCounts: PerClassCounts;
  tumorArea: number;
  tumorDetected: boolean;
  classMap: Uint8Array;
  confidence: number;
}

export function parseOutputTensor(
  outputBuffer: ArrayBuffer,
  width: number,
  height: number
): SegmentationResult {
  const outputData = new Float32Array(outputBuffer);
  const numPixels = width * height;

  // Model output is [1, 256, 256, 1] with sigmoid activation.
  // Each value is a probability in [0, 1].
  // Threshold at 0.5 to produce binary segmentation mask.
  const threshold = config.ai.confidenceThreshold;
  const classMap = new Uint8Array(numPixels);
  let tumorPixels = 0;
  let sumProb = 0;

  for (let i = 0; i < numPixels; i++) {
    const prob = outputData[i];
    sumProb += prob;
    if (prob > threshold) {
      classMap[i] = 1;
      tumorPixels++;
    }
  }

  const tumorDetected = tumorPixels > 0;
  const tumorArea = tumorDetected
    ? parseFloat(((tumorPixels / numPixels) * 100).toFixed(2))
    : 0;
  const confidence = tumorDetected
    ? parseFloat((sumProb / numPixels).toFixed(4))
    : parseFloat((sumProb / numPixels).toFixed(4));

  const maskBase64 = renderBinaryMask(classMap, width, height, 'binary');
  const overlayBase64 = renderBinaryMask(classMap, width, height, 'overlay');

  return {
    maskBase64,
    overlayBase64,
    perClassCounts: {
      background: numPixels - tumorPixels,
      necrotic_core: 0,
      edema: tumorDetected ? tumorPixels : 0,
      enhancing_tumor: 0,
    },
    tumorArea,
    tumorDetected,
    classMap,
    confidence,
  };
}

export function parseOutputTensorUint8(
  outputBuffer: ArrayBuffer,
  width: number,
  height: number
): SegmentationResult {
  const outputData = new Uint8Array(outputBuffer);
  const numPixels = width * height;

  const classMap = new Uint8Array(numPixels);
  let tumorPixels = 0;

  for (let i = 0; i < numPixels; i++) {
    const val = outputData[i];
    const isTumor = val > 0;
    classMap[i] = isTumor ? 1 : 0;
    if (isTumor) tumorPixels++;
  }

  const tumorDetected = tumorPixels > 0;
  const tumorArea = tumorDetected
    ? parseFloat(((tumorPixels / numPixels) * 100).toFixed(2))
    : 0;
  const confidence = tumorDetected
    ? parseFloat((tumorPixels / numPixels).toFixed(4))
    : 0;

  const maskBase64 = renderBinaryMask(classMap, width, height, 'binary');
  const overlayBase64 = renderBinaryMask(classMap, width, height, 'overlay');

  return {
    maskBase64,
    overlayBase64,
    perClassCounts: {
      background: numPixels - tumorPixels,
      necrotic_core: 0,
      edema: tumorDetected ? tumorPixels : 0,
      enhancing_tumor: 0,
    },
    tumorArea,
    tumorDetected,
    classMap,
    confidence,
  };
}

function renderBinaryMask(
  classMap: Uint8Array,
  width: number,
  height: number,
  mode: MaskRenderMode
): string {
  const pixels = new Uint8Array(width * height * 4);

  if (mode === 'binary') {
    for (let i = 0; i < width * height; i++) {
      const offset = i * 4;
      if (classMap[i] === 1) {
        pixels[offset] = 255;
        pixels[offset + 1] = 255;
        pixels[offset + 2] = 255;
        pixels[offset + 3] = 255;
      } else {
        pixels[offset] = 0;
        pixels[offset + 1] = 0;
        pixels[offset + 2] = 0;
        pixels[offset + 3] = 255;
      }
    }
  } else {
    for (let i = 0; i < width * height; i++) {
      const offset = i * 4;
      if (classMap[i] === 1) {
        pixels[offset] = TUMOR_COLOR[0];
        pixels[offset + 1] = TUMOR_COLOR[1];
        pixels[offset + 2] = TUMOR_COLOR[2];
        pixels[offset + 3] = TUMOR_COLOR[3];
      } else {
        pixels[offset] = 0;
        pixels[offset + 1] = 0;
        pixels[offset + 2] = 0;
        pixels[offset + 3] = 0;
      }
    }
  }

  return encodePngToBase64(pixels, width, height);
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(data: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function adler32(data: Uint8Array): number {
  let a = 1, b = 0;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const typeBytes = encoder.encode(type);
  const length = data.length;
  const chunk = new Uint8Array(12 + length);

  chunk[0] = (length >> 24) & 0xFF;
  chunk[1] = (length >> 16) & 0xFF;
  chunk[2] = (length >> 8) & 0xFF;
  chunk[3] = length & 0xFF;

  chunk.set(typeBytes, 4);
  chunk.set(data, 8);

  const crcInput = new Uint8Array(4 + length);
  crcInput.set(typeBytes);
  crcInput.set(data, 4);
  const crcVal = crc32(crcInput);

  chunk[8 + length] = (crcVal >> 24) & 0xFF;
  chunk[8 + length + 1] = (crcVal >> 16) & 0xFF;
  chunk[8 + length + 2] = (crcVal >> 8) & 0xFF;
  chunk[8 + length + 3] = crcVal & 0xFF;

  return chunk;
}

function buildIHDR(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  data[0] = (width >> 24) & 0xFF;
  data[1] = (width >> 16) & 0xFF;
  data[2] = (width >> 8) & 0xFF;
  data[3] = width & 0xFF;
  data[4] = (height >> 24) & 0xFF;
  data[5] = (height >> 16) & 0xFF;
  data[6] = (height >> 8) & 0xFF;
  data[7] = height & 0xFF;
  data[8] = 8;
  data[9] = 6;
  data[10] = 0;
  data[11] = 0;
  data[12] = 0;
  return pngChunk('IHDR', data);
}

function deflateRaw(data: Uint8Array): Uint8Array {
  const MAX_BLOCK = 65535;
  const numBlocks = Math.ceil(data.length / MAX_BLOCK);

  let totalSize = 6;
  for (let i = 0; i < numBlocks; i++) {
    const blockLen = Math.min(data.length - i * MAX_BLOCK, MAX_BLOCK);
    totalSize += 5 + blockLen;
  }

  const result = new Uint8Array(totalSize);
  let offset = 0;

  result[offset++] = 0x78;
  result[offset++] = 0x01;

  for (let i = 0; i < numBlocks; i++) {
    const start = i * MAX_BLOCK;
    const blockLen = Math.min(data.length - start, MAX_BLOCK);
    const isFinal = i === numBlocks - 1 ? 1 : 0;

    result[offset++] = isFinal;

    result[offset++] = blockLen & 0xFF;
    result[offset++] = (blockLen >> 8) & 0xFF;
    const nlen = (~blockLen) & 0xFFFF;
    result[offset++] = nlen & 0xFF;
    result[offset++] = (nlen >> 8) & 0xFF;

    result.set(data.subarray(start, start + blockLen), offset);
    offset += blockLen;
  }

  const adler = adler32(data);
  result[offset++] = (adler >> 24) & 0xFF;
  result[offset++] = (adler >> 16) & 0xFF;
  result[offset++] = (adler >> 8) & 0xFF;
  result[offset++] = adler & 0xFF;

  return result;
}

function buildIDAT(pixels: Uint8Array, width: number, height: number): Uint8Array {
  const rowSize = 1 + width * 4;
  const filtered = new Uint8Array(height * rowSize);
  for (let y = 0; y < height; y++) {
    filtered[y * rowSize] = 0;
    filtered.set(
      pixels.subarray(y * width * 4, (y + 1) * width * 4),
      y * rowSize + 1
    );
  }

  const compressed = deflateRaw(filtered);
  return pngChunk('IDAT', compressed);
}

function buildIEND(): Uint8Array {
  return pngChunk('IEND', new Uint8Array(0));
}

function encodePngToBase64(
  pixels: Uint8Array,
  width: number,
  height: number
): string {
  const ihdr = buildIHDR(width, height);
  const idat = buildIDAT(pixels, width, height);
  const iend = buildIEND();

  const totalLength = PNG_SIGNATURE.length + ihdr.length + idat.length + iend.length;
  const png = new Uint8Array(totalLength);
  let offset = 0;
  png.set(PNG_SIGNATURE, offset); offset += PNG_SIGNATURE.length;
  png.set(ihdr, offset); offset += ihdr.length;
  png.set(idat, offset); offset += idat.length;
  png.set(iend, offset);

  let binary = '';
  for (let i = 0; i < png.length; i++) {
    binary += String.fromCharCode(png[i]);
  }
  const base64 = btoa(binary);
  return `data:image/png;base64,${base64}`;
}

export function generatePerClassStats(
  _perClassCounts: PerClassCounts,
  totalPixels: number
): TumorStats {
  return {
    tumor_area: 0,
    per_class_counts: { background: totalPixels, necrotic_core: 0, edema: 0, enhancing_tumor: 0 },
    inference_time: undefined,
    timestamp: new Date().toISOString(),
  };
}

export function calculateBoundingBox(
  classMap: Uint8Array,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } | null {
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (classMap[y * width + x] !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return null;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}