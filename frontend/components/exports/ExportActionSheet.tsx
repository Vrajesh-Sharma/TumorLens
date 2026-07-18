import React from 'react';
import { View, Text, Pressable, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { pdfExportService } from '../../services/pdfExport';
import { imageExportService } from '../../services/imageExportService';
import { Report } from '../../types/report';

interface Props {
  visible: boolean;
  onClose: () => void;
  report: Report;
  overlayBase64?: string | null;
  onExportComplete?: (message: string) => void;
}

const EXPORT_OPTIONS = [
  {
    id: 'pdf',
    icon: 'document-text-outline' as const,
    label: 'PDF Report',
    description: 'Full medical report with images and stats',
    color: '#C5221F',
  },
  {
    id: 'png',
    icon: 'image-outline' as const,
    label: 'PNG Screenshot',
    description: 'Lossless image of the analysis view',
    color: '#137333',
  },
  {
    id: 'jpeg',
    icon: 'image-outline' as const,
    label: 'JPEG Screenshot',
    description: 'Compressed image for quick sharing',
    color: '#B06000',
  },
  {
    id: 'share_all',
    icon: 'share-outline' as const,
    label: 'Share All Files',
    description: 'PDF + images in one share',
    color: '#0B57D0',
  },
];

export default function ExportActionSheet({ visible, onClose, report, overlayBase64, onExportComplete }: Props) {
  const { isDark } = useTheme();
  const [exporting, setExporting] = React.useState<string | null>(null);

  const handleExport = async (id: string) => {
    setExporting(id);
    try {
      switch (id) {
        case 'pdf': {
          const uri = await pdfExportService.exportReportToPdf(report);
          await imageExportService.shareImage(uri);
          onExportComplete?.('PDF exported and shared successfully.');
          break;
        }
        case 'png':
        case 'jpeg': {
          if (!overlayBase64) throw new Error('No overlay image to export.');
          const format = id as 'png' | 'jpeg';
          const uri = await imageExportService.saveBase64Image(overlayBase64, format);
          await imageExportService.shareImage(uri);
          onExportComplete?.(`${format.toUpperCase()} image exported and shared.`);
          break;
        }
        case 'share_all': {
          const pdfUri = await pdfExportService.exportReportToPdf(report);
          if (overlayBase64) {
            const imgUri = await imageExportService.saveBase64Image(overlayBase64, 'png');
            await imageExportService.shareMultiple([pdfUri, imgUri]);
          } else {
            await imageExportService.shareImage(pdfUri);
          }
          onExportComplete?.('All files shared successfully.');
          break;
        }
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Export Failed', err.message || 'Unable to complete export.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable
          className={`bg-surface dark:bg-surface-dark rounded-t-3xl pt-6 pb-10 px-5`}
          onPress={() => {}}
        >
          <View className="items-center mb-5">
            <Text className="text-lg font-bold text-text dark:text-text-dark">Export Report</Text>
            <Text className="text-xs text-subText dark:text-subText-dark mt-1">
              Choose format to export {report.patientName}&apos;s analysis
            </Text>
          </View>

          {EXPORT_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => handleExport(option.id)}
              disabled={exporting !== null}
              className="flex-row items-center gap-4 p-4 mb-2 rounded-xl border border-border/20 dark:border-border-dark/20"
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${option.color}15` }}>
                <Ionicons name={option.icon} size={20} color={option.color} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-text dark:text-text-dark">
                  {exporting === option.id ? 'Exporting...' : option.label}
                </Text>
                <Text className="text-[10px] text-subText dark:text-subText-dark mt-0.5">
                  {option.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={isDark ? '#8E918F' : '#5F6368'} />
            </Pressable>
          ))}

          <Pressable
            onPress={onClose}
            className="mt-4 py-3.5 rounded-xl items-center border border-border/30 dark:border-border-dark/30"
          >
            <Text className="text-xs font-bold text-text dark:text-text-dark">Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
