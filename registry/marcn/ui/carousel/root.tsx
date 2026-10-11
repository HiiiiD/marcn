import { useEffect, useRef, useState } from 'react';
import { View, type ScrollView } from 'react-native';
import { CarouselContext, type CarouselContextValue, type ItemLayout } from '@/registry/marcn/ui/carousel/context';
import { itemOffsets, leadingIndex, nearestIndex, neighborOffset, snapPoints } from '@/registry/marcn/ui/carousel/math';
import type { CarouselProps } from '@/registry/marcn/ui/carousel/types';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';

const createStyles = (t: Theme) => ({ gap: t.spacing[4] });

export function Carousel({
  orientation = 'horizontal',
  snap = true,
  align = 'start',
  gap,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  style,
  children,
  ...props
}: CarouselProps) {
  const defaults = useStyles(createStyles);
  const gapSize = gap ?? defaults.gap;
  const horizontal = orientation === 'horizontal';
  const scrollRef = useRef<ScrollView>(null);
  const [viewport, setViewport] = useState(0);
  const [contentSize, setContentSize] = useState(0);
  const offsetRef = useRef(0);
  const [edge, setEdge] = useState<'start' | 'middle' | 'end'>('start');
  const [layouts, setLayouts] = useState<ItemLayout[]>([]);
  const [count, setCount] = useState(0);
  const [index, setIndex] = useControllableState({ value: indexProp, defaultValue: defaultIndex, onChange: onIndexChange });

  const max = Math.max(contentSize - viewport, 0);
  // Android lays rows out right-to-left in RTL (item 0 gets the largest x) and reports the physical scrollX,
  // so work in a mirrored "logical" space and flip only at the ScrollView boundary.
  const first = layouts[0];
  const last = layouts[layouts.length - 1];
  const rtl = horizontal && !!first && !!last && layouts.length > 1 && first.start > last.start;
  const mirror = (v: number) => (rtl ? max - v : v);
  const starts = layouts.map((l) => (l ? (rtl ? contentSize - l.start - l.size : l.start) : 0));
  const sizes = layouts.map((l) => l?.size ?? 0);
  const offsets = itemOffsets({ starts, sizes, viewport, content: contentSize, align: snap ? align : 'start' });
  const points = snap ? snapPoints(offsets) : starts.map((start) => Math.min(Math.round(start), max));
  const targetOf = (i: number) => (snap ? offsets[i] : points[i]);
  const indexAt = (value: number) => (snap ? nearestIndex(offsets, value, index) : leadingIndex(starts, sizes, value));

  const scrollToOffset = (value: number, animated = true) =>
    scrollRef.current?.scrollTo(horizontal ? { x: mirror(value), animated } : { y: value, animated });

  const step = (direction: 1 | -1) => {
    const next = neighborOffset(points, offsetRef.current, direction, max);
    if (next === null) return;
    scrollToOffset(next);
    setIndex(indexAt(next));
  };

  const ready = viewport > 0 && layouts.length > 0;
  const sync = (animated: boolean) => {
    const target = targetOf(index);
    // Android's initial RTL scroll events can report a stale offset, so always re-assert the position there.
    if (target === undefined || (!rtl && Math.abs(offsetRef.current - target) <= 1)) return;
    // A non-animated scrollTo issued in the same frame as the first layout is dropped on Android.
    if (animated) scrollToOffset(target, true);
    else requestAnimationFrame(() => scrollToOffset(target, false));
  };
  // Re-run when geometry changes (first real layout, rotation, resize) so the current slide stays in place.
  const geometry = `${viewport}|${contentSize}|${points.join(',')}`;
  useEffect(() => {
    if (ready) sync(false);
  }, [ready, geometry]);
  useEffect(() => {
    if (ready && indexProp !== undefined) sync(true);
  }, [indexProp]);

  const value: CarouselContextValue = {
    orientation,
    snap,
    align,
    gap: gapSize,
    viewport,
    index,
    count,
    canScrollPrev: edge !== 'start',
    canScrollNext: max > 0 && edge !== 'end',
    scrollTo: (i, animated = true) => {
      const target = targetOf(i);
      if (target === undefined) return;
      setIndex(i);
      scrollToOffset(target, animated);
    },
    scrollPrev: () => step(-1),
    scrollNext: () => step(1),
    scrollRef,
    snapPoints: rtl ? points.map(mirror).sort((a, b) => a - b) : points,
    setViewport,
    setContentSize,
    handleScroll: (raw) => {
      const o = mirror(raw);
      offsetRef.current = o;
      setEdge(o <= 1 ? 'start' : max > 0 && o >= max - 1 ? 'end' : 'middle');
    },
    handleScrollEnd: (end) => setIndex(indexAt(mirror(end))),
    setCount: (n) => {
      setCount(n);
      setLayouts((prev) => (prev.length > n ? prev.slice(0, n) : prev));
    },
    registerItem: (i, layout) =>
      setLayouts((prev) => {
        const current = prev[i];
        if (current && current.start === layout.start && current.size === layout.size) return prev;
        const next = prev.slice();
        next[i] = layout;
        return next;
      }),
  };

  return (
    <CarouselContext.Provider value={value}>
      <View style={[{ position: 'relative' }, style]} {...props}>
        {children}
      </View>
    </CarouselContext.Provider>
  );
}
