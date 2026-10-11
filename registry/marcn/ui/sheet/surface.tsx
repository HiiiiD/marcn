import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWindowDimensions, View, type AccessibilityActionEvent, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { asText, useOverlay } from '@/registry/marcn/ui/overlay/overlay-root';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';
import { SheetDragContext, useBodyDrag } from '@/registry/marcn/ui/sheet/scroll';
import { dragPosition, settle } from '@/registry/marcn/ui/sheet/snap';
import { createStyles } from '@/registry/marcn/ui/sheet/styles';
import type { SurfaceProps } from '@/registry/marcn/ui/sheet/types';

export function SheetSurface({
  side = 'bottom',
  showHandle = side === 'bottom',
  snapPoints,
  snapIndex,
  defaultSnapIndex = 0,
  onSnapIndexChange,
  dragBody = true,
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

  const release = useCallback(
    (current: number, velocity: number) => {
      const result = settle({ position: current, velocity, hidden, lowestSize: sizes ? sizes[0] : extent.value });
      if ('dismiss' in result) {
        setOpen(false);
        return;
      }
      landed.current = result.index;
      setIndex(result.index);
      position.value = withSpring(hidden[result.index]);
    },
    [hidden, sizes, extent, position, setOpen, setIndex],
  );

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
          release(
            dragPosition(start.value + dir * (vertical ? e.translationY : e.translationX)),
            dir * (vertical ? e.velocityY : e.velocityX),
          );
        }),
    [dir, vertical, position, start, release],
  );

  const { pan: bodyPan, drag } = useBodyDrag({ enabled: dragBody, dir, vertical, position, start, release });

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
    <SheetDragContext.Provider key="body" value={drag}>
      <GestureDetector gesture={bodyPan}>
        <View
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
      </GestureDetector>
    </SheetDragContext.Provider>
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
