import React, { useState } from 'react';
import { View, ScrollView, Text, Alert, Pressable, useWindowDimensions } from 'react-native';
import { ScreenContainer } from '../../components/ui/layout/Layouts';
import { AppHeader } from '../../components/ui/navigation/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { 
  UploadCard, 
  ImagePreview, 
  ImageInfoCard, 
  PermissionCard, 
  UploadTipCard,
  PatientDetails,
} from '../../components/upload';
import type { PatientFormData } from '../../components/upload/PatientDetails';
import { 
  selectFromGallery, 
  captureWithCamera, 
  selectFromFileSystem,
  SelectedImage,
  requestCameraPermission,
  requestGalleryPermission
} from '../../services/imagePicker';
import { validateMriImage } from '../../utils/imageUtils';
import { useScanStore } from '../../store';

export default function UploadScreen() {
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: '',
    notes: '',
  });

  const [galleryPermissionDenied, setGalleryPermissionDenied] = useState(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);

  const { setCurrentScan } = useScanStore();

  const validateAndSetImage = (img: SelectedImage) => {
    const validation = validateMriImage(img);
    if (!validation.valid) {
      setValidationError(validation.message || 'Image validation failed.');
      Alert.alert('Scan Refused', validation.message);
      return;
    }
    setSelectedImage(img);
    setValidationError(null);
  };

  const handleSelectFromGallery = async () => {
    try {
      setValidationError(null);
      const img = await selectFromGallery();
      if (img) {
        validateAndSetImage(img);
        setGalleryPermissionDenied(false);
      }
    } catch (err: any) {
      if (err.message?.includes('denied')) {
        setGalleryPermissionDenied(true);
      } else {
        Alert.alert('Gallery Error', 'Unable to access photos gallery. Please check system settings.');
      }
    }
  };

  const handleCaptureWithCamera = async () => {
    try {
      setValidationError(null);
      const img = await captureWithCamera();
      if (img) {
        validateAndSetImage(img);
        setCameraPermissionDenied(false);
      }
    } catch (err: any) {
      if (err.message?.includes('denied')) {
        setCameraPermissionDenied(true);
      } else {
        Alert.alert('Camera Error', 'Camera module is unavailable or blocked on this device.');
      }
    }
  };

  const handleSelectFromFiles = async () => {
    try {
      setValidationError(null);
      const img = await selectFromFileSystem();
      if (img) {
        validateAndSetImage(img);
      }
    } catch {
      Alert.alert('File Error', 'Unable to select file. Please try again.');
    }
  };

  const retryGalleryPermission = async () => {
    const granted = await requestGalleryPermission();
    if (granted) {
      setGalleryPermissionDenied(false);
      handleSelectFromGallery();
    } else {
      Alert.alert('Permission Denied', 'Gallery access is required to import structural MRI slices.');
    }
  };

  const retryCameraPermission = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setCameraPermissionDenied(false);
      handleCaptureWithCamera();
    } else {
      Alert.alert('Permission Denied', 'Camera authorization is required to capture scanning films.');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setValidationError(null);
  };

  const handleZoomImage = () => {
    Alert.alert(
      'Interactive Volumetric Zoom',
      'The multi-dimensional zoom layer is processed on device. Slice alignment is optimal.',
      [{ text: 'Close' }]
    );
  };

  const isFormValid = selectedImage && patientData.name.trim() && patientData.age && patientData.gender;

  const handleContinue = () => {
    if (!selectedImage || !isFormValid) return;

    const scanId = `scan_${Date.now()}`;
    setCurrentScan({
      id: scanId,
      originalImageUri: selectedImage.uri,
      maskImageUri: '',
      overlayImageUri: '',
      predictionScore: 0,
      tumorDetected: false,
      createdAt: new Date().toISOString(),
    });

    router.push({
      pathname: '/result',
      params: {
        imageUri: selectedImage.uri,
        fileName: patientData.name,
        patientAge: patientData.age,
        patientGender: patientData.gender,
      },
    });
  };

  return (
    <ScreenContainer scrollable={false}>
      <AppHeader 
        title="Upload MRI" 
        subtitle="Brain MRI Analysis" 
        showBack={true} 
      />

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
      >
        {!selectedImage && (
          <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-5 bg-surface dark:bg-surface-dark border border-border/45 dark:border-border-dark/45 rounded-2xl p-5 shadow-sm`}>
            <View className="flex-row items-center gap-2 mb-3.5">
              <Ionicons name="medical-outline" size={16} color={isDark ? '#81C995' : '#137333'} />
              <Text className="text-sm font-bold text-text dark:text-text-dark">MRI Intake Guidelines</Text>
            </View>
            <View className="gap-2.5">
              <View className="flex-row justify-between items-center pb-2 border-b border-border/10 dark:border-border-dark/10">
                <Text className="text-xs text-subText dark:text-subText-dark">Supported Formats</Text>
                <Text className="text-xs font-bold text-text dark:text-text-dark">PNG, JPEG</Text>
              </View>
              <View className="flex-row justify-between items-center pb-2 border-b border-border/10 dark:border-border-dark/10">
                <Text className="text-xs text-subText dark:text-subText-dark">Maximum Size</Text>
                <Text className="text-xs font-bold text-text dark:text-text-dark">10 MB</Text>
              </View>
              <View className="flex-row justify-between items-center pb-2 border-b border-border/10 dark:border-border-dark/10">
                <Text className="text-xs text-subText dark:text-subText-dark">Recommended Resolution</Text>
                <Text className="text-xs font-bold text-text dark:text-text-dark">240x240 px or higher</Text>
              </View>
              <View className="mt-1 bg-warning/5 dark:bg-warning/10 p-3 rounded-xl border border-warning/15 dark:border-warning-dark/15 flex-row gap-2">
                <Ionicons name="alert-circle-outline" size={14} color={isDark ? '#FDD663' : '#B06000'} className="mt-0.5" />
                <Text className="text-[10px] text-warning dark:text-warning-dark font-medium leading-4 flex-1">
                  <Text className="font-bold">Disclaimer:</Text> AI assisted classifications serve as recommendations. Diagnostic confirmation requires senior clinical review.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-5`}>
          {galleryPermissionDenied ? (
            <PermissionCard type="gallery" onRequestPermission={retryGalleryPermission} />
          ) : cameraPermissionDenied ? (
            <PermissionCard type="camera" onRequestPermission={retryCameraPermission} />
          ) : !selectedImage ? (
            <UploadCard 
              onGalleryPress={handleSelectFromGallery} 
              onCameraPress={handleCaptureWithCamera}
              onFilePickerPress={handleSelectFromFiles}
            />
          ) : (
            <View className="gap-5">
              <ImagePreview 
                imageUri={selectedImage.uri} 
                onReplace={handleSelectFromGallery} 
                onRemove={handleRemoveImage}
                onZoom={handleZoomImage}
              />
              <ImageInfoCard image={selectedImage} />
              <PatientDetails data={patientData} onChange={setPatientData} />
            </View>
          )}

          {(validationError) && (
            <View className="mt-4 bg-danger/10 dark:bg-danger/15 border border-danger/25 dark:border-danger-dark/25 p-3 rounded-xl flex-row items-center gap-2">
              <Ionicons name="close-circle-outline" size={16} color={isDark ? '#F28B82' : '#C5221F'} />
              <Text className="text-xs font-semibold text-danger dark:text-danger-dark flex-1">
                {validationError}
              </Text>
            </View>
          )}
        </View>

        {selectedImage && (
          <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-6`}>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <PressableButton
                  onPress={handleContinue}
                  disabled={!isFormValid}
                  isDark={isDark}
                  variant="primary"
                  label="Continue"
                  icon="arrow-forward-outline"
                />
              </View>
              <View className="flex-1">
                <PressableButton
                  onPress={() => { setSelectedImage(null); setValidationError(null); }}
                  disabled={false}
                  isDark={isDark}
                  variant="outline"
                  label="Cancel"
                  icon="close-outline"
                />
              </View>
            </View>
            {!isFormValid && selectedImage && (
              <Text className="text-[11px] text-subText dark:text-subText-dark text-center mt-2">
                Fill in patient details to continue
              </Text>
            )}
          </View>
        )}

        {!selectedImage && (
          <View className={`${isTablet ? 'mx-12' : 'mx-5'} mb-4`}>
            <Text className="text-sm font-bold text-text dark:text-text-dark mb-3">
              Best Practices for Uploads
            </Text>
            <UploadTipCard 
              title="Use High-Resolution Slices" 
              description="High fidelity T2-weighted structural scans yield high-confidence segmentation boundaries." 
              iconName="image-outline"
              delayIndex={0}
            />
            <UploadTipCard 
              title="Avoid Motion Artifacts" 
              description="Ensure the scan does not contain blur, lines or movement sweeps to prevent false positive classifications." 
              iconName="aperture-outline"
              delayIndex={1}
            />
            <UploadTipCard 
              title="Axial Orientation Preferred" 
              description="Our model was trained on BraTS datasets using transverse/axial brain slices for best segmentation scores." 
              iconName="compass-outline"
              delayIndex={2}
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressableButton({
  onPress,
  disabled,
  isDark,
  variant,
  label,
  icon,
}: {
  onPress: () => void;
  disabled: boolean;
  isDark: boolean;
  variant: 'primary' | 'outline';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';
  const bgColor = isPrimary
    ? disabled
      ? 'bg-primary/40 dark:bg-primary-dark/20'
      : 'bg-primary dark:bg-primary-dark'
    : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark';
  const textColor = isPrimary
    ? 'text-white dark:text-background-dark'
    : 'text-text dark:text-text-dark';
  const iconColor = isPrimary
    ? isDark ? '#051E3C' : '#FFFFFF'
    : isDark ? '#C4C7C5' : '#5F6368';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { if (!disabled) scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      disabled={disabled}
      style={animatedStyle}
      className={`w-full py-4 rounded-xl flex-row items-center justify-center gap-2 ${bgColor} ${disabled ? 'opacity-60' : ''}`}
    >
      <Ionicons name={icon} size={16} color={disabled ? (isDark ? '#4A5A74' : '#B0B8C5') : iconColor} />
      <Text className={`text-sm font-bold ${disabled ? 'text-white/60 dark:text-text-dark/40' : textColor}`}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
