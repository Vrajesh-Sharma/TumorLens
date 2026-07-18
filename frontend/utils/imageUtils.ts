import { SelectedImage } from '../services/imagePicker';

export interface ImageValidationError {
  valid: boolean;
  message?: string;
}

/**
 * Validates selected MRI scan image.
 * Supported formats: PNG, JPEG
 * Maximum size: 10 MB (10,485,760 bytes)
 */
export function validateMriImage(image: SelectedImage | null): ImageValidationError {
  if (!image) {
    return { valid: false, message: 'No structural MRI scan selected.' };
  }

  // Detect and validate type
  const type = image.type ? image.type.toLowerCase() : '';
  const fileName = image.fileName ? image.fileName.toLowerCase() : '';
  const isSupportedType = type.includes('png') || type.includes('jpeg') || type.includes('jpg');
  const isSupportedExtension = fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
  
  if (!isSupportedType && !isSupportedExtension) {
    return { 
      valid: false, 
      message: 'Unsupported image format. Only medical PNG or JPEG/JPG MRI scans are accepted.' 
    };
  }

  // Size validation: 10 MB
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (image.fileSize && image.fileSize > MAX_SIZE_BYTES) {
    return { 
      valid: false, 
      message: `File size exceeds the 10 MB limit. (Selected: ${formatFileSize(image.fileSize)})` 
    };
  }

  return { valid: true };
}

/**
 * Formats file size in bytes to a human-readable string (KB, MB).
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || bytes === 0) return 'Unknown Size';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function extractImageMetadata(image: SelectedImage) {
  const acquisitionDate = new Date();
  const acquisitionString = acquisitionDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return {
    name: image.fileName || 'mri_scan.jpg',
    width: image.width,
    height: image.height,
    dimensions: `${image.width} × ${image.height} px`,
    size: formatFileSize(image.fileSize),
    type: detectImageType(image),
    acquisitionTime: acquisitionString,
  };
}

/**
 * Detects image type from MIME type or file extension.
 */
export function detectImageType(image: SelectedImage): 'PNG' | 'JPEG' | 'Unsupported' {
  const type = image.type?.toLowerCase() || '';
  const name = image.fileName?.toLowerCase() || '';

  if (type.includes('png') || name.endsWith('.png')) return 'PNG';
  if (type.includes('jpeg') || type.includes('jpg') || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'JPEG';
  return 'Unsupported';
}
export default {
  validateMriImage,
  formatFileSize,
  extractImageMetadata,
  detectImageType
};
