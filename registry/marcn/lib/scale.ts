import { Dimensions, PixelRatio, Platform } from 'react-native';

// Width of the design frames (Figma) that sizes are authored against.
const GUIDELINE_WIDTH = 390;
// Cap so tablets stay phone-sized; the shortest side keeps it stable across rotation.
const MAX_SCALE_WIDTH = 430;

const { width, height } = Dimensions.get('window');
const baseWidth = Math.min(width, height, MAX_SCALE_WIDTH);

export const scale = (size: number) => (baseWidth / GUIDELINE_WIDTH) * size;

export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// The +-0.5 nudge reconciles iOS and Android font rendering; tune it for your font family.
export const font = (size: number) => {
  const rounded = Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));
  return Platform.OS === 'ios' ? rounded + 0.5 : rounded - 0.5;
};
