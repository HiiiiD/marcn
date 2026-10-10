import { useContext, useEffect } from 'react';
import type { ViewProps } from 'react-native';
import { Loader2 } from 'lucide-react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Icon, type IconProps } from '@/registry/marcn/ui/icon';
import { TextStyleContext } from '@/registry/marcn/ui/text';

export type SpinnerProps = ViewProps & Pick<IconProps, 'size' | 'color' | 'strokeWidth'>;

export function Spinner({ size, color, strokeWidth, style, ...props }: SpinnerProps) {
  const inherited = useContext(TextStyleContext)?.color;
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1);
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animated = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[animated, style]}
      {...props}
    >
      <Icon
        icon={Loader2}
        size={size}
        color={color ?? (typeof inherited === 'string' ? inherited : undefined)}
        strokeWidth={strokeWidth}
      />
    </Animated.View>
  );
}
