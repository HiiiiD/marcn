import { useContext } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useStyles } from '@/registry/marcn/lib/theme';
import { AreaContext } from '@/registry/marcn/ui/scroll-area/context';
import { thumbMetrics } from '@/registry/marcn/ui/scroll-area/math';
import { TRACK_PADDING, createStyles } from '@/registry/marcn/ui/scroll-area/styles';

type Orientation = 'vertical' | 'horizontal';

export type ScrollBarProps = React.ComponentProps<typeof Animated.View> & { orientation?: Orientation };

export function ScrollBar({ orientation, style, testID, ...props }: ScrollBarProps) {
  const s = useStyles(createStyles);
  const area = useContext(AreaContext);
  if (!area) throw new Error('ScrollBar must be used within <ScrollArea>');
  const axis: Orientation = orientation ?? (area.horizontal ? 'horizontal' : 'vertical');
  const fade = useAnimatedStyle(() => ({ opacity: area.opacity.value }));
  const thumb = thumbMetrics({ ...area.metrics, track: area.metrics.viewport - TRACK_PADDING * 2 });
  if (!thumb.visible || (axis === 'horizontal') !== area.horizontal) return null;
  const vertical = axis === 'vertical';
  return (
    <Animated.View style={[s.track, s[axis], fade, style]} testID={testID} {...props}>
      <View
        testID={testID ? `${testID}-thumb` : undefined}
        style={[
          vertical ? s.thumbVertical : s.thumbHorizontal,
          vertical
            ? { height: thumb.size, transform: [{ translateY: thumb.position }] }
            : { width: thumb.size, transform: [{ translateX: thumb.position }] },
        ]}
      />
    </Animated.View>
  );
}
