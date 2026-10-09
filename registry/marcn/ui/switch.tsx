import { useEffect } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';

export type SwitchProps = Omit<PressableProps, 'style' | 'children' | 'onPress'> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const TRAVEL = 16;

const createStyles = (t: Theme) =>
  StyleSheet.create({
    track: { width: 36, height: 20, borderRadius: t.radius.full, justifyContent: 'center', paddingHorizontal: 2 },
    thumb: { width: 16, height: 16, borderRadius: t.radius.full },
    disabled: { opacity: 0.5 },
  });

export function Switch({ checked = false, onCheckedChange, disabled, style, ...props }: SwitchProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 150 });
  }, [checked, progress]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.input, colors.primary]),
  }));
  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.background, colors.primaryForeground]),
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      style={[disabled && s.disabled, style]}
      {...props}
    >
      <Animated.View style={[s.track, track]}>
        <Animated.View style={[s.thumb, thumb]} />
      </Animated.View>
    </Pressable>
  );
}
