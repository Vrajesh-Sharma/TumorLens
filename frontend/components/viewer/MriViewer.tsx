import React, { useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface MriViewerProps {
  originalUri: string | null;
  overlayUri: string | null;
  maskUri: string | null;
  overlayOpacity: number;
}

type ViewMode = 'overlay' | 'original' | 'mask';

export function MriViewer({
  originalUri,
  overlayUri,
  maskUri,
  overlayOpacity,
}: MriViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overlay');

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .minPointers(2)
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const tapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.5) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(3);
        savedScale.value = 3;
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);
  const allGestures = Gesture.Exclusive(composed, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const modeLabel = {
    overlay: 'Segmentation Overlay',
    original: 'Raw Structural Slice',
    mask: 'Binary Mask',
  };

  return (
    <View className="bg-slate-950 rounded-2xl border border-border/40 dark:border-border-dark/40 overflow-hidden shadow-sm">
      <View className="flex-row bg-slate-900 border-b border-border/10 p-1.5 gap-1.5">
        <Pressable
          onPress={() => setViewMode('overlay')}
          className={`flex-1 py-2 rounded-lg items-center justify-center ${viewMode === 'overlay' ? 'bg-slate-800' : ''}`}
        >
          <Text className={`text-xs font-bold ${viewMode === 'overlay' ? 'text-white' : 'text-slate-400'}`}>
            Overlay
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('original')}
          className={`flex-1 py-2 rounded-lg items-center justify-center ${viewMode === 'original' ? 'bg-slate-800' : ''}`}
        >
          <Text className={`text-xs font-bold ${viewMode === 'original' ? 'text-white' : 'text-slate-400'}`}>
            Original
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('mask')}
          className={`flex-1 py-2 rounded-lg items-center justify-center ${viewMode === 'mask' ? 'bg-slate-800' : ''}`}
        >
          <Text className={`text-xs font-bold ${viewMode === 'mask' ? 'text-white' : 'text-slate-400'}`}>
            Mask
          </Text>
        </Pressable>
      </View>

      <GestureDetector gesture={allGestures}>
        <Animated.View className="w-full h-80 items-center justify-center relative bg-slate-950 overflow-hidden">
          <Animated.View style={animatedStyle} className="w-full h-full">
            {viewMode === 'mask' && maskUri ? (
              <Image source={{ uri: maskUri }} className="w-full h-full" resizeMode="contain" />
            ) : originalUri ? (
              <Image source={{ uri: originalUri }} className="w-full h-full" resizeMode="contain" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={48} color="#4A4F5A" />
                <Text className="text-xs text-slate-400 mt-2">Image Unavailable</Text>
              </View>
            )}

            {viewMode === 'overlay' && overlayUri && originalUri && overlayOpacity > 0 && (
              <View className="absolute inset-0" pointerEvents="none">
                <Image
                  source={{ uri: overlayUri }}
                  className="w-full h-full"
                  resizeMode="contain"
                  style={{ opacity: overlayOpacity }}
                />
              </View>
            )}
          </Animated.View>

          <View className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded">
            <Text className="text-[8px] font-bold text-white uppercase font-mono">
              {modeLabel[viewMode]}
            </Text>
          </View>

          <View className="absolute bottom-3 right-3 flex-row gap-1.5">
            <Pressable
              onPress={() => {
                const newScale = Math.min(5, scale.value + 0.5);
                scale.value = withTiming(newScale);
                savedScale.value = newScale;
              }}
              className="bg-black/60 w-8 h-8 rounded-full items-center justify-center"
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => {
                const newScale = Math.max(1, scale.value - 0.5);
                scale.value = withTiming(newScale);
                savedScale.value = newScale;
                if (newScale <= 1) {
                  translateX.value = withTiming(0);
                  translateY.value = withTiming(0);
                  savedTranslateX.value = 0;
                  savedTranslateY.value = 0;
                }
              }}
              className="bg-black/60 w-8 h-8 rounded-full items-center justify-center"
            >
              <Ionicons name="remove" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default MriViewer;
