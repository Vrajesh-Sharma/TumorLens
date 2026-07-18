import { Dimensions, PixelRatio, Platform, ScaledSize } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export function scale(size: number): number {
  const scaleFactor = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function verticalScale(size: number): number {
  const scaleFactor = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * scaleFactor;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export function moderateScale(size: number, factor = 0.5): number {
  return size + (scale(size) - size) * factor;
}

export function hp(percent: number): number {
  return Math.round((SCREEN_HEIGHT * percent) / 100);
}

export function wp(percent: number): number {
  return Math.round((SCREEN_WIDTH * percent) / 100);
}

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;
export const isTablet = SCREEN_WIDTH >= 768;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export function useResponsive() {
  const window = Dimensions.get('window');

  return {
    width: window.width,
    height: window.height,
    isSmallDevice: window.width < 375,
    isTablet: window.width >= 768,
    scale: (size: number) => {
      const factor = window.width / BASE_WIDTH;
      return Math.round(PixelRatio.roundToNearestPixel(size * factor));
    },
    verticalScale: (size: number) => {
      const factor = window.height / BASE_HEIGHT;
      return Math.round(PixelRatio.roundToNearestPixel(size * factor));
    },
    hp: (percent: number) => Math.round((window.height * percent) / 100),
    wp: (percent: number) => Math.round((window.width * percent) / 100),
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
}
