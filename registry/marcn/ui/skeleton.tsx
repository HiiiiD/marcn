import { useEffect } from 'react';
import { StyleSheet, type ViewProps } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';

const createStyles = (t: Theme) =>
  StyleSheet.create({ skeleton: { backgroundColor: t.colors.accent, borderRadius: t.radius.md } });

export function Skeleton({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.5, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
    );
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s.skeleton, animated, style]} {...props} />;
}
