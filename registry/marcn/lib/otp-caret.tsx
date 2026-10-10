import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';

const createStyles = (t: Theme) =>
  StyleSheet.create({ caret: { width: 2, height: t.fontSize.base + 2, backgroundColor: t.colors.foreground } });

export function OtpCaret() {
  const s = useStyles(createStyles);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(0, { duration: 500 }), withTiming(1, { duration: 500 })), -1);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" style={[s.caret, animated]} />;
}
