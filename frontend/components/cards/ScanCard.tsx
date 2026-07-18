import React from 'react';
import { View, Text, Image } from 'react-native';
import { SegmentationResponse } from '../../types';
import { formatConfidence, formatScanDate, formatTumorArea } from '../../utils';

interface ScanCardProps {
  scan: SegmentationResponse;
}

export function ScanCard({ scan }: ScanCardProps) {
  const statusBg = scan.tumorDetected ? 'bg-danger/10 border-danger/20' : 'bg-success/10 border-success/20';
  const statusTextClass = scan.tumorDetected ? 'text-danger' : 'text-success';
  const statusLabel = scan.tumorDetected ? 'Anomaly Detected' : 'No Anomaly';

  return (
    <View className="bg-surface border border-border p-4 rounded-2xl flex-row items-center gap-4 mb-3">
      {/* Scan Image Preview */}
      <View className="w-16 h-16 rounded-xl bg-background overflow-hidden justify-center items-center border border-border">
        {scan.originalImageUri ? (
          <Image 
            source={{ uri: scan.originalImageUri }} 
            className="w-full h-full" 
            resizeMode="cover" 
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-slate-800">
            <Text className="text-subText text-[10px] font-bold uppercase tracking-wider">MRI</Text>
          </View>
        )}
      </View>

      {/* Scan Info */}
      <View className="flex-1 justify-between">
        <View className="flex-row items-center justify-between mb-1.5">
          <View className={`px-2.5 py-0.5 rounded-full border ${statusBg}`}>
            <Text className={`text-[11px] font-bold ${statusTextClass}`}>
              {statusLabel}
            </Text>
          </View>
          <Text className="text-subText text-xs">
            {formatScanDate(scan.createdAt)}
          </Text>
        </View>

        <Text className="text-text font-bold text-sm">
          Scanner Case ID: #{scan.id.substring(0, 8).toUpperCase()}
        </Text>

        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-subText text-xs">
            Confidence:{' '}
            <Text className="text-text font-semibold">
              {formatConfidence(scan.predictionScore)}
            </Text>
          </Text>
          {scan.tumorDetected && (
            <Text className="text-subText text-xs">
              Area:{' '}
              <Text className="text-text font-semibold">
                {formatTumorArea(scan.tumorAreaMm2)}
              </Text>
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default ScanCard;
