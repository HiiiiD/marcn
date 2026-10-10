import { useCallback, useEffect, useState, type Ref } from 'react';
import { StyleSheet, useWindowDimensions, type LayoutChangeEvent, type View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps } from '@/registry/marcn/lib/overlay-root';
import { computePosition, type Align, type Rect, type Side, type Size } from '@/registry/marcn/lib/popover-position';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    surface: {
      position: 'absolute',
      width: 288,
      padding: t.spacing[4],
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.popover,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    unplaced: { left: 0, top: 0, opacity: 0 },
  });

export const Popover = OverlayRoot;
export type PopoverProps = OverlayRootProps;
export const PopoverTrigger = OverlayTrigger;

type SurfaceProps = ViewProps & {
  side?: Side;
  align?: Align;
  sideOffset?: number;
  alignOffset?: number;
  avoidCollisions?: boolean;
  collisionPadding?: number;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export type PopoverContentProps = SurfaceProps & {
  modal?: boolean;
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function PopoverContent({ modal = false, dismissable, initialFocusRef, ...props }: PopoverContentProps) {
  return (
    <Overlay modal={modal} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <PopoverSurface {...props} />
    </Overlay>
  );
}

const sameRect = (a: Rect | null, b: Rect) => !!a && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

function PopoverSurface({
  side = 'bottom',
  align = 'center',
  sideOffset = 4,
  alignOffset = 0,
  avoidCollisions = true,
  collisionPadding = 8,
  style,
  render,
  onLayout,
  ...props
}: SurfaceProps) {
  const s = useStyles(createStyles);
  const { open, triggerRef } = useOverlay();
  const progress = useProgress(open);
  const window = useWindowDimensions();
  const { height: keyboard } = useKeyboardInset();
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [size, setSize] = useState<Size | null>(null);

  const measure = useCallback(() => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      const next = { x, y, width, height };
      setAnchor((prev) => (sameRect(prev, next) ? prev : next));
    });
  }, [triggerRef]);

  useEffect(measure, [measure, window.width, window.height, keyboard]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
    measure();
    onLayout?.(e);
  };

  const position =
    anchor && size
      ? computePosition(anchor, size, { width: window.width, height: window.height - keyboard }, {
          side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding,
        })
      : null;

  const fade = useAnimatedStyle(() => ({ opacity: progress.value }));

  return renderElement(Animated.View, render, {
    ...props,
    onLayout: handleLayout,
    style: [s.surface, fade, position ? { left: position.x, top: position.y } : s.unplaced, style],
  } as ViewProps);
}
