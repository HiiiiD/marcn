import { useEffect, useMemo, useRef, useState, type Ref } from 'react';
import { StyleSheet, useWindowDimensions, View, type AccessibilityActionEvent, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { asText, OverlayClose, OverlayRoot, OverlayTrigger, useOverlay } from '@/registry/marcn/lib/overlay-root';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { dragPosition, RUBBER_LIMIT, settle } from '@/registry/marcn/lib/sheet-snap';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';

export { DialogHeader as SheetHeader, DialogFooter as SheetFooter, DialogTitle as SheetTitle, DialogDescription as SheetDescription } from '@/registry/marcn/ui/dialog';

// Drawn behind the open edge so a stretched sheet never reveals a gap.
const STRETCH = RUBBER_LIMIT * 2;

const createStyles = (t: Theme) =>
  StyleSheet.create({
    surface: { position: 'absolute', backgroundColor: t.colors.background, borderColor: t.colors.border },
    bottom: {
      left: 0, right: 0, bottom: 0, maxHeight: '90%', flexDirection: 'column',
      borderTopWidth: 1, borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl,
    },
    top: {
      left: 0, right: 0, top: 0, maxHeight: '90%', flexDirection: 'column',
      borderBottomWidth: 1, borderBottomLeftRadius: t.radius.xl, borderBottomRightRadius: t.radius.xl,
    },
    left: { top: 0, bottom: 0, left: 0, width: '75%', maxWidth: 384, flexDirection: 'row', borderRightWidth: 1 },
    right: { top: 0, bottom: 0, right: 0, width: '75%', maxWidth: 384, flexDirection: 'row', borderLeftWidth: 1 },
    body: { flexShrink: 1, flexGrow: 1, padding: t.spacing[4], gap: t.spacing[4] },
    bodyFit: { flexGrow: 0 },
    handleHit: { alignItems: 'center', justifyContent: 'center', padding: t.spacing[3] },
    handleBar: { borderRadius: t.radius.full, backgroundColor: t.colors.border },
    handleBarHorizontal: { width: 40, height: 4 },
    handleBarVertical: { width: 4, height: 40 },
    stretch: { position: 'absolute', backgroundColor: t.colors.background },
    stretchBottom: { top: '100%', left: 0, right: 0, height: STRETCH },
    stretchTop: { bottom: '100%', left: 0, right: 0, height: STRETCH },
    stretchLeft: { right: '100%', top: 0, bottom: 0, width: STRETCH },
    stretchRight: { left: '100%', top: 0, bottom: 0, width: STRETCH },
  });

export const Sheet = OverlayRoot;
export const SheetTrigger = OverlayTrigger;
export const SheetClose = OverlayClose;

export type SheetSide = 'top' | 'bottom' | 'left' | 'right';

type SurfaceProps = ViewProps & {
  side?: SheetSide;
  showHandle?: boolean;
  /** Visible sizes: fractions of the window (<= 1), pixels, or `'auto'` to fit the content (measured once on open). The handle snaps between them. */
  snapPoints?: (number | 'auto')[];
  snapIndex?: number;
  defaultSnapIndex?: number;
  onSnapIndexChange?: (index: number) => void;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export type SheetContentProps = SurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function SheetContent({ dismissable, initialFocusRef, ...props }: SheetContentProps) {
  return (
    <Overlay dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <SheetSurface {...props} />
    </Overlay>
  );
}

function SheetSurface({
  side = 'bottom',
  showHandle = side === 'bottom',
  snapPoints,
  snapIndex,
  defaultSnapIndex = 0,
  onSnapIndexChange,
  style,
  render,
  children,
  onLayout,
  ...props
}: SurfaceProps) {
  const s = useStyles(createStyles);
  const { open, setOpen } = useOverlay();
  const { width, height } = useWindowDimensions();
  const progress = useProgress(open);
  const { inset } = useKeyboardInset();
  const insets = useSafeAreaInsets();

  const vertical = side === 'top' || side === 'bottom';
  const dir = side === 'top' || side === 'left' ? -1 : 1;
  const extent = useSharedValue(vertical ? height : width);

  // 'auto' tracks the content: while the surface is unsized its own layout is the content size; once a larger
  // snap fixes its size, only the body (which no longer grows) still reports the content, as a delta from the last unsized pair.
  const hasAuto = !!snapPoints?.includes('auto');
  const [fit, setFit] = useState<number | null>(null);
  const measuring = hasAuto && fit === null;
  const measured = useRef({ fit: 0, body: 0 });

  const limit = vertical ? (height - insets.top) * 0.9 : width;
  const snapKey = snapPoints?.join();
  const sizes = useMemo(
    () =>
      measuring
        ? undefined
        : snapPoints
            ?.map((p) => Math.min(p === 'auto' ? fit! : p <= 1 ? p * (vertical ? height : width) : p, limit))
            .sort((a, b) => a - b),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [snapKey, measuring, fit, vertical, height, width, limit],
  );
  const largest = sizes ? sizes[sizes.length - 1] : 0;
  // Each snap's distance below the largest: the sheet is as tall as the largest and slides down to show a smaller one.
  const hidden = useMemo(() => (sizes ? sizes.map((size) => largest - size) : [0]), [sizes, largest]);

  const [rawIndex, setIndex] = useControllableState({ value: snapIndex, defaultValue: defaultSnapIndex, onChange: onSnapIndexChange });
  const index = Math.min(Math.max(rawIndex, 0), hidden.length - 1);

  // Distance below the largest snap; negative while stretched past it.
  const position = useSharedValue(hidden[index]);
  const start = useSharedValue(0);
  const landed = useRef(index);

  // A reopen during the exit animation must not start from the dismissed offset.
  useEffect(() => {
    if (open) position.value = withTiming(hidden[index], { duration: 150 });
  }, [open, position, hidden, index]);
  useEffect(() => {
    if (landed.current === index) return;
    landed.current = index;
    position.value = withTiming(hidden[index], { duration: 150 });
  }, [index, hidden, position]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .withTestId('sheet-handle')
        .runOnJS(true)
        .onBegin(() => {
          start.value = position.value;
        })
        .onUpdate((e) => {
          position.value = dragPosition(start.value + dir * (vertical ? e.translationY : e.translationX));
        })
        .onEnd((e) => {
          const result = settle({
            position: dragPosition(start.value + dir * (vertical ? e.translationY : e.translationX)),
            velocity: dir * (vertical ? e.velocityY : e.velocityX),
            hidden,
            lowestSize: sizes ? sizes[0] : extent.value,
          });
          if ('dismiss' in result) {
            setOpen(false);
            return;
          }
          landed.current = result.index;
          setIndex(result.index);
          position.value = withSpring(hidden[result.index]);
        }),
    [dir, vertical, position, start, extent, hidden, sizes, setOpen, setIndex],
  );

  const animated = useAnimatedStyle(() => {
    const offset = dir * ((1 - progress.value) * extent.value + position.value);
    return {
      transform: vertical ? [{ translateY: offset }] : [{ translateX: offset }],
      ...(side === 'bottom'
        ? {
            bottom: inset.value,
            // The keyboard already covers the gesture bar once it is up.
            paddingBottom: Math.max(0, insets.bottom - inset.value),
            maxHeight: (height - inset.value - insets.top) * 0.9,
          }
        : null),
    };
  });
  const edge =
    side === 'top' ? { paddingTop: insets.top }
    : side === 'left' ? { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left }
    : side === 'right' ? { paddingTop: insets.top, paddingBottom: insets.bottom, paddingRight: insets.right }
    : null;

  // Left unsized while 'auto' is the largest snap, so the surface keeps reporting the content's size.
  const sized = sizes && !(hasAuto && fit !== null && Math.min(fit, limit) >= largest) ? largest : null;

  const steps = hidden.length > 1;
  const step = (by: number) => {
    const next = Math.min(Math.max(index + by, 0), hidden.length - 1);
    if (next !== index) setIndex(next);
  };
  const stepProps = steps
    ? {
        accessible: true,
        accessibilityRole: 'adjustable' as const,
        accessibilityLabel: 'Sheet size',
        accessibilityValue: { text: `${index + 1} of ${hidden.length}` },
        accessibilityActions: [{ name: 'increment' as const }, { name: 'decrement' as const }],
        onAccessibilityAction: (e: AccessibilityActionEvent) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1),
      }
    : null;

  const handle = showHandle ? (
    <GestureDetector key="handle" gesture={pan}>
      <View style={s.handleHit} {...stepProps}>
        <View style={[s.handleBar, vertical ? s.handleBarHorizontal : s.handleBarVertical]} />
      </View>
    </GestureDetector>
  ) : null;
  const body = (
    <View
      key="body"
      testID="sheet-body"
      style={[s.body, hasAuto && s.bodyFit]}
      onLayout={(e) => {
        const size = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width;
        if (sized === null) measured.current.body = size;
        else if (hasAuto) setFit(Math.max(0, Math.ceil(measured.current.fit + size - measured.current.body)));
      }}
    >
      {asText(children)}
    </View>
  );
  const filler = (
    <View
      key="stretch"
      testID="sheet-stretch"
      pointerEvents="none"
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={[s.stretch, s[`stretch${side[0].toUpperCase()}${side.slice(1)}` as 'stretchBottom']]}
    />
  );
  const handleFirst = side === 'bottom' || side === 'right';

  return renderElement(Animated.View, render, {
    ...props,
    onLayout: (e: LayoutChangeEvent) => {
      const size = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width;
      extent.value = size;
      if (hasAuto && sized === null) {
        measured.current.fit = size;
        setFit(Math.ceil(size));
      }
      onLayout?.(e);
    },
    style: [s.surface, s[side], sized === null ? null : vertical ? { height: sized } : { width: sized }, edge, animated, style],
    children: handleFirst ? [handle, body, filler] : [body, handle, filler],
  } as ViewProps);
}
