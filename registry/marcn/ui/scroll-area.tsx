import { createContext, useContext, useState, type ReactElement, type Ref } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming, type SharedValue } from 'react-native-reanimated';
import { thumbMetrics } from '@/registry/marcn/lib/scrollbar-math';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';

type Orientation = 'vertical' | 'horizontal';
type Metrics = { viewport: number; content: number; offset: number };
type AreaContext = { horizontal: boolean; metrics: Metrics; opacity: SharedValue<number> };

export type ScrollAreaProps = ScrollViewProps & { scrollBar?: ReactElement | null; ref?: Ref<ScrollView> };
export type ScrollBarProps = React.ComponentProps<typeof Animated.View> & { orientation?: Orientation };

const AreaContext = createContext<AreaContext | null>(null);

const TRACK_PADDING = 1;
const IDLE_MS = 800;

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { position: 'relative', overflow: 'hidden' },
    track: { position: 'absolute', padding: TRACK_PADDING, pointerEvents: 'none' },
    vertical: { top: 0, bottom: 0, end: 0, width: 10 },
    horizontal: { start: 0, end: 0, bottom: 0, height: 10 },
    thumbVertical: { width: '100%', borderRadius: t.radius.full, backgroundColor: t.colors.border },
    thumbHorizontal: { height: '100%', borderRadius: t.radius.full, backgroundColor: t.colors.border },
  });

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

export function ScrollArea({ scrollBar, style, children, onLayout, onContentSizeChange, onScroll, ref, ...props }: ScrollAreaProps) {
  const s = useStyles(createStyles);
  const horizontal = !!props.horizontal;
  const [metrics, setMetrics] = useState<Metrics>({ viewport: 0, content: 0, offset: 0 });
  const opacity = useSharedValue(0);
  return (
    <AreaContext.Provider value={{ horizontal, metrics, opacity }}>
      <View style={[s.root, style]}>
        <ScrollView
          ref={ref}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          {...props}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setMetrics((m) => ({ ...m, viewport: horizontal ? width : height }));
            onLayout?.(e);
          }}
          onContentSizeChange={(width, height) => {
            setMetrics((m) => ({ ...m, content: horizontal ? width : height }));
            onContentSizeChange?.(width, height);
          }}
          onScroll={(e) => {
            const { x, y } = e.nativeEvent.contentOffset;
            setMetrics((m) => ({ ...m, offset: horizontal ? x : y }));
            opacity.value = withSequence(withTiming(1, { duration: 100 }), withDelay(IDLE_MS, withTiming(0, { duration: 300 })));
            onScroll?.(e);
          }}
        >
          {children}
        </ScrollView>
        {scrollBar === undefined ? <ScrollBar /> : scrollBar}
      </View>
    </AreaContext.Provider>
  );
}
