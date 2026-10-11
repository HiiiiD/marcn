import { useState, type ReactElement, type Ref } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { useStyles } from '@/registry/marcn/lib/theme';
import { AreaContext, type Metrics } from '@/registry/marcn/ui/scroll-area/context';
import { ScrollBar } from '@/registry/marcn/ui/scroll-area/scroll-bar';
import { createStyles } from '@/registry/marcn/ui/scroll-area/styles';

export { ScrollBar, type ScrollBarProps } from '@/registry/marcn/ui/scroll-area/scroll-bar';

export type ScrollAreaProps = ScrollViewProps & { scrollBar?: ReactElement | null; ref?: Ref<ScrollView> };

const IDLE_MS = 800;

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
