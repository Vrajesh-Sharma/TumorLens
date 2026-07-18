import React, { useMemo } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../theme';

interface OpacitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 24;

export function OpacitySlider({ value, onValueChange }: OpacitySliderProps) {
  const { isDark } = useTheme();
  const trackWidth = useSharedValue(200);
  const offset = useSharedValue(value * trackWidth.value);
  const savedOffset = useSharedValue(value * trackWidth.value);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width - THUMB_SIZE;
    offset.value = value * trackWidth.value;
    savedOffset.value = value * trackWidth.value;
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      savedOffset.value = offset.value;
    })
    .onUpdate((e) => {
      const newOffset = Math.max(0, Math.min(trackWidth.value, savedOffset.value + e.translationX));
      offset.value = newOffset;
      const newValue = trackWidth.value > 0 ? newOffset / trackWidth.value : 0;
      runOnJS(onValueChange)(Math.round(newValue * 100) / 100);
    })
    .onEnd(() => {
      savedOffset.value = offset.value;
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: offset.value + THUMB_SIZE / 2,
  }));

  const displayValue = useMemo(() => Math.round(value * 100), [value]);

  return (
    <View className="bg-surface dark:bg-surface-dark border border-border/40 dark:border-border-dark/40 rounded-2xl p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary-dark/10 items-center justify-center">
            <Ionicons name="layers-outline" size={14} color={isDark ? '#A8C7FA' : '#0B57D0'} />
          </View>
          <Text className="text-xs font-bold text-text dark:text-text-dark">
            Mask Opacity
          </Text>
        </View>
        <Text className="text-xs font-bold text-primary dark:text-primary-dark font-mono">
          {displayValue}%
        </Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <View
          className="relative justify-center"
          onLayout={onTrackLayout}
          style={{ height: THUMB_SIZE + 8 }}
        >
          <View
            className="absolute left-0 right-0 rounded-full bg-border/40 dark:bg-border-dark/40 overflow-hidden"
            style={{ height: TRACK_HEIGHT }}
          >
            <Animated.View
              className="h-full rounded-full bg-primary dark:bg-primary-dark"
              style={fillStyle}
            />
          </View>

          <Animated.View
            className="absolute w-6 h-6 rounded-full bg-white dark:bg-slate-200 shadow-md justify-center items-center"
            style={[
              thumbStyle,
              {
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              },
            ]}
          >
            <View className="w-2 h-2 rounded-full bg-primary dark:bg-primary-dark" />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

export default OpacitySlider;
