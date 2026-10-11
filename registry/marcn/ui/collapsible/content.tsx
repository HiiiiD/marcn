import { useEffect, useState, type Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useCollapsible, type CollapsibleState } from '@/registry/marcn/ui/collapsible/context';

const DURATION = 200;
const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  // Absolute so the measured height is the content's own, not squeezed by the animated parent height.
  natural: { position: 'absolute', top: 0, left: 0, right: 0 },
});

export type CollapsibleContentProps = ViewProps & {
  forceMount?: boolean;
  render?: RenderProp<ViewProps, CollapsibleState>;
  ref?: Ref<View>;
};

export function CollapsibleContent({ forceMount, render, style, children, ...props }: CollapsibleContentProps) {
  const { open, disabled } = useCollapsible();
  const [mounted, setMounted] = useState(open);
  const measured = useSharedValue(0);
  const progress = useSharedValue(open ? 1 : 0);

  // Unmount is timer-driven rather than animation-callback-driven so it stays JS-only and testable.
  useEffect(() => {
    if (open) {
      setMounted(true);
      progress.value = withTiming(1, { duration: DURATION });
      return;
    }
    progress.value = withTiming(0, { duration: DURATION });
    const timer = setTimeout(() => setMounted(false), DURATION);
    return () => clearTimeout(timer);
  }, [open, progress]);

  const animated = useAnimatedStyle(() => {
    if (measured.value === 0 && progress.value === 1) return {};
    return { height: progress.value * measured.value };
  });

  if (!(forceMount || open || mounted)) return null;

  return renderElement(
    Animated.View,
    render,
    {
      accessibilityElementsHidden: !open,
      importantForAccessibility: open ? 'auto' : 'no-hide-descendants',
      ...props,
      style: [styles.clip, animated],
      children: (
        <View style={[styles.natural, style]} onLayout={(e) => (measured.value = e.nativeEvent.layout.height)}>
          {children}
        </View>
      ),
    } as ViewProps,
    { open, disabled },
  );
}
