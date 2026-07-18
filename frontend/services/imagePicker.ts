import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';

export interface SelectedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
  fileName?: string;
}

/**
 * Requests permissions to access the gallery/media library.
 */
export async function requestGalleryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === ImagePicker.PermissionStatus.GRANTED;
}

/**
 * Requests permissions to access the camera.
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Opens the device gallery for image selection.
 */
export async function selectFromGallery(): Promise<SelectedImage | null> {
  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) {
    throw new Error('Gallery permission denied');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  
  // Note: On some platforms or web, fileSize is undefined. We will handle fallback validation.
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize || undefined,
    type: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || asset.uri.split('/').pop() || 'mri_scan.jpg',
  };
}

/**
 * Opens the system camera to capture an MRI scan.
 */
export async function captureWithCamera(): Promise<SelectedImage | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Camera permission denied');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 1,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize || undefined,
    type: asset.mimeType || 'image/jpeg',
    fileName: asset.fileName || asset.uri.split('/').pop() || 'captured_scan.jpg',
  };
}

/**
 * Opens the system file picker to select an MRI scan image.
 */
export async function selectFromFileSystem(): Promise<SelectedImage | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/png', 'image/jpeg', 'image/jpg'],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: 0,
    height: 0,
    fileSize: asset.size || undefined,
    type: asset.mimeType || 'image/jpeg',
    fileName: asset.name || 'selected_scan.jpg',
  };
}
