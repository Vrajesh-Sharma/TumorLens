import { File, Directory, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { storageService } from './storageService';

class ImageExportServiceImpl {
  async saveBase64Image(base64: string, format: 'png' | 'jpeg'): Promise<string> {
    const ext = format === 'png' ? 'png' : 'jpg';
    const filename = `export_${Date.now()}.${ext}`;
    const exportsDir = new Directory(Paths.document, 'app_data', 'exports');
    const f = new File(exportsDir, filename);

    const stripped = base64.startsWith('data:') ? base64.split(',')[1] || base64 : base64;
    await f.write(stripped, { encoding: 'base64' });
    return f.uri;
  }

  async shareImage(uri: string): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) throw new Error('Sharing not available on this platform.');
    await Sharing.shareAsync(uri, {
      mimeType: uri.endsWith('.png') ? 'image/png' : 'image/jpeg',
      dialogTitle: 'Share MRI Analysis',
    });
  }

  async shareMultiple(uris: string[]): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) throw new Error('Sharing not available.');
    await Sharing.shareAsync(uris[0], {
      mimeType: 'application/octet-stream',
      dialogTitle: 'Share Export Files',
    });
  }
}

export const imageExportService = new ImageExportServiceImpl();
export default imageExportService;
