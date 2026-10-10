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

export type AnchorPoint = { x: number; y: number };

// `fit` picks top or bottom by available room and caps maxHeight to it, so the surface never covers its anchor.
export type PositionOptions = AnchoredOptions & { point?: AnchorPoint | null; fit?: boolean };

const FIT_MIN_ROOM = 180;

// Splits the position props off a component's props, applying that component's own defaults.
export function splitAnchored<P extends AnchoredOptions>(props: P, defaults: AnchoredOptions = {}) {
  const { side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding, ...rest } = props;
  const options: AnchoredOptions = {
    side: side ?? defaults.side,
    align: align ?? defaults.align,
    sideOffset,
    alignOffset,
    avoidCollisions,
    collisionPadding,
  };
  return [options, rest] as const;
}

const UNPLACED = { left: 0, top: 0 };

const sameRect = (a: Rect | null, b: Rect) => !!a && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

export function useAnchoredPosition(open: boolean, triggerRef: RefObject<View | null>, options: PositionOptions = {}) {
  const { side = 'bottom', align = 'center', sideOffset = 4, alignOffset = 0, avoidCollisions = true, collisionPadding = 8, point, fit = false } = options;
  const progress = useProgress(open);
  const window = useWindowDimensions();
  const { height: keyboard } = useKeyboardInset();
  const insets = useSafeAreaInsets();
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  const px = point?.x;
  const py = point?.y;
  const measure = useCallback(() => {
    if (px !== undefined && py !== undefined) {
      const next = { x: px, y: py, width: 0, height: 0 };
      setAnchor((prev) => (sameRect(prev, next) ? prev : next));
      return;
    }
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const next = { x, y, width, height };
      setAnchor((prev) => (sameRect(prev, next) ? prev : next));
    });
  }, [triggerRef, px, py]);

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
  const room = anchor && {
    bottom: free.height - (anchor.y - insets.top + anchor.height) - sideOffset - collisionPadding,
    top: anchor.y - insets.top - sideOffset - collisionPadding,
  };
  const fitSide: Side = room && fit ? (room.bottom >= FIT_MIN_ROOM || room.bottom >= room.top ? 'bottom' : 'top') : side;
  const computed =
    anchor && size
      ? computePosition({ ...anchor, x: anchor.x - insets.left, y: anchor.y - insets.top }, size, free, {
          side: fitSide, align, sideOffset, alignOffset, avoidCollisions, collisionPadding,
        })
      : null;
  const position = computed && { ...computed, x: computed.x + insets.left, y: computed.y + insets.top };

  const isPlaced = !!position;
  const placed = useSharedValue(isPlaced ? 1 : 0);
  useEffect(() => {
    placed.value = isPlaced ? 1 : 0;
  }, [placed, isPlaced]);
  // Gated in the worklet: the UI thread would otherwise override a static opacity.
  const fade = useAnimatedStyle(() => ({ opacity: placed.value ? progress.value : 0 }));

  return {
    anchor,
    maxHeight: Math.max(0, room && fit ? room[fitSide as 'top' | 'bottom'] : free.height - collisionPadding * 2),
    onLayout,
    style: [fade, position ? { left: position.x, top: position.y } : UNPLACED] as StyleProp<ViewStyle>,
  };
}
