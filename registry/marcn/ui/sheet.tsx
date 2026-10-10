import { useEffect, useMemo, type Ref } from 'react';
import { StyleSheet, useWindowDimensions, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { asText, OverlayClose, OverlayRoot, OverlayTrigger, useOverlay } from '@/registry/marcn/lib/overlay-root';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';

export { DialogHeader as SheetHeader, DialogFooter as SheetFooter, DialogTitle as SheetTitle, DialogDescription as SheetDescription } from '@/registry/marcn/ui/dialog';

const DISMISS_FRACTION = 0.3;
const DISMISS_VELOCITY = 800;

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
    handleHit: { alignItems: 'center', justifyContent: 'center', padding: t.spacing[3] },
    handleBar: { borderRadius: t.radius.full, backgroundColor: t.colors.border },
    handleBarHorizontal: { width: 40, height: 4 },
    handleBarVertical: { width: 4, height: 40 },
  });

export const Sheet = OverlayRoot;
export const SheetTrigger = OverlayTrigger;
export const SheetClose = OverlayClose;

export type SheetSide = 'top' | 'bottom' | 'left' | 'right';

type SurfaceProps = ViewProps & {
  side?: SheetSide;
  showHandle?: boolean;
  snapPoints?: number[];
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

  const vertical = side === 'top' || side === 'bottom';
  const dir = side === 'top' || side === 'left' ? -1 : 1;
  const extent = useSharedValue(vertical ? height : width);
  const drag = useSharedValue(0);

  // A reopen during the exit animation must not start from the dismissed offset.
  useEffect(() => {
    if (open) drag.value = withTiming(0, { duration: 150 });
  }, [open, drag]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .withTestId('sheet-handle')
        .runOnJS(true)
        .onUpdate((e) => {
          drag.value = Math.max(0, dir * (vertical ? e.translationY : e.translationX));
        })
        .onEnd((e) => {
          const distance = dir * (vertical ? e.translationY : e.translationX);
          const velocity = dir * (vertical ? e.velocityY : e.velocityX);
          if (distance > extent.value * DISMISS_FRACTION || velocity > DISMISS_VELOCITY) setOpen(false);
          else drag.value = withSpring(0);
        }),
    [dir, vertical, drag, extent, setOpen],
  );

  const animated = useAnimatedStyle(() => {
    const offset = dir * ((1 - progress.value) * extent.value + drag.value);
    return {
      transform: vertical ? [{ translateY: offset }] : [{ translateX: offset }],
      ...(side === 'bottom' ? { bottom: inset.value, maxHeight: (height - inset.value) * 0.9 } : null),
    };
  });

  const size = snapPoints?.[0];
  const sized = size === undefined ? null : size <= 1 ? size * (vertical ? height : width) : size;

  const handle = showHandle ? (
    <GestureDetector key="handle" gesture={pan}>
      <View style={s.handleHit}>
        <View style={[s.handleBar, vertical ? s.handleBarHorizontal : s.handleBarVertical]} />
      </View>
    </GestureDetector>
  ) : null;
  const body = (
    <View key="body" style={s.body}>
      {asText(children)}
    </View>
  );
  const handleFirst = side === 'bottom' || side === 'right';

  return renderElement(Animated.View, render, {
    ...props,
    onLayout: (e: LayoutChangeEvent) => {
      extent.value = vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width;
      onLayout?.(e);
    },
    style: [s.surface, s[side], sized === null ? null : vertical ? { height: sized } : { width: sized }, animated, style],
    children: handleFirst ? [handle, body] : [body, handle],
  } as ViewProps);
}
