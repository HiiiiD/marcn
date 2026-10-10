import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useWindowDimensions, type LayoutChangeEvent, type StyleProp, type View, type ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { computePosition, type Align, type Rect, type Side, type Size } from '@/registry/marcn/lib/popover-position';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';

export type AnchoredOptions = {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
};

const UNPLACED = { left: 0, top: 0 };

const sameRect = (a: Rect | null, b: Rect) => !!a && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

export function useAnchoredPosition(open: boolean, triggerRef: RefObject<View | null>, options: AnchoredOptions = {}) {
  const { side = 'bottom', align = 'center', sideOffset = 4, alignOffset = 0, avoidCollisions = true, collisionPadding = 8 } = options;
  const progress = useProgress(open);
  const window = useWindowDimensions();
  const { height: keyboard } = useKeyboardInset();
  const insets = useSafeAreaInsets();
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  const measure = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const next = { x, y, width, height };
      setAnchor((prev) => (sameRect(prev, next) ? prev : next));
    });
  }, [triggerRef]);

  useEffect(measure, [measure, window.width, window.height, keyboard]);
  // The host (a Dialog, say) is still animating its own keyboard lift, so measure again once it settles.
  useEffect(() => {
    if (keyboard === 0) return;
    const timer = setTimeout(measure, 250);
    return () => clearTimeout(timer);
  }, [measure, keyboard]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
      measure();
    },
    [measure],
  );

  // Place inside the area the system bars and keyboard leave free, then shift back to window coordinates.
  const bottom = Math.max(keyboard, insets.bottom);
  const free = { width: window.width - insets.left - insets.right, height: window.height - insets.top - bottom };
  const computed =
    anchor && size
      ? computePosition({ ...anchor, x: anchor.x - insets.left, y: anchor.y - insets.top }, size, free, {
          side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding,
        })
      : null;
  const position = computed && { ...computed, x: computed.x + insets.left, y: computed.y + insets.top };

  const placed = useSharedValue(position ? 1 : 0);
  useEffect(() => {
    placed.value = position ? 1 : 0;
  }, [placed, position]);
  // Gated in the worklet: the UI thread would otherwise override a static opacity.
  const fade = useAnimatedStyle(() => ({ opacity: placed.value ? progress.value : 0 }));

  return {
    anchor,
    maxHeight: Math.max(0, free.height - collisionPadding * 2),
    onLayout,
    style: [fade, position ? { left: position.x, top: position.y } : UNPLACED] as StyleProp<ViewStyle>,
  };
}
