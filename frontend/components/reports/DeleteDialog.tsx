import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface DeleteDialogProps {
  visible: boolean;
  patientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ visible, patientName, onConfirm, onCancel }: DeleteDialogProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <View className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 p-6 rounded-2xl shadow-xl w-full max-w-[320px]">
          <View className="w-10 h-10 rounded-full bg-danger/10 items-center justify-center mb-4">
            <Ionicons name="trash-outline" size={20} color="#C5221F" />
          </View>

          <Text className="text-sm font-bold text-text dark:text-text-dark">
            Delete Scan Record?
          </Text>

          <Text className="text-xs text-subText dark:text-subText-dark mt-2 leading-5">
            Are you sure you want to permanently delete the diagnostic report for <Text className="font-bold text-text dark:text-text-dark">{patientName}</Text>? This action cannot be undone.
          </Text>

          <View className="flex-row gap-3 mt-6">
            <Pressable
              onPress={onCancel}
              className="flex-1 bg-border/20 dark:bg-border-dark/20 py-2.5 rounded-xl items-center"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Text className="text-xs font-bold text-subText dark:text-subText-dark">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              className="flex-1 bg-danger py-2.5 rounded-xl items-center"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Text className="text-xs font-bold text-white">
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default DeleteDialog;
