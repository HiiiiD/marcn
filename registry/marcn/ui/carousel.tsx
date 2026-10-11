import { Children, useContext, useEffect, useRef, useState, type Ref } from 'react';
import { I18nManager, ScrollView, View, type ScrollViewProps, type ViewProps } from 'react-native';
import {
  CarouselContext,
  CarouselItemContext,
  useCarousel,
  type CarouselContextValue,
  type ItemLayout,
} from '@/registry/marcn/lib/carousel-context';
import { itemOffsets, leadingIndex, nearestIndex, neighborOffset, snapPoints, type CarouselAlign } from '@/registry/marcn/lib/carousel-math';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { Button, type ButtonProps } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';

export { useCarousel };

export type CarouselProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  snap?: boolean;
  align?: CarouselAlign;
  gap?: number;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  ref?: Ref<View>;
};
export type CarouselContentProps = Omit<ScrollViewProps, 'horizontal'> & { ref?: Ref<ScrollView> };
export type CarouselItemProps = ViewProps & { basis?: number; ref?: Ref<View> };

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
  const [offset, setOffset] = useState(0);
  const [layouts, setLayouts] = useState<ItemLayout[]>([]);
  const [index, setIndex] = useControllableState({ value: indexProp, defaultValue: defaultIndex, onChange: onIndexChange });

  const starts = layouts.map((l) => l?.start ?? 0);
  const sizes = layouts.map((l) => l?.size ?? 0);
  const max = Math.max(contentSize - viewport, 0);
  const offsets = itemOffsets({ starts, sizes, viewport, content: contentSize, align: snap ? align : 'start' });
  const points = snap ? snapPoints(offsets) : starts.map((start) => Math.min(Math.round(start), max));
  const targetOf = (i: number) => (snap ? offsets[i] : points[i]);
  const indexAt = (value: number) => (snap ? nearestIndex(offsets, value, index) : leadingIndex(starts, sizes, value));

  const scrollToOffset = (value: number, animated = true) =>
    scrollRef.current?.scrollTo(horizontal ? { x: value, animated } : { y: value, animated });

  const step = (direction: 1 | -1) => {
    const next = neighborOffset(points, offset, direction, max);
    if (next === null) return;
    scrollToOffset(next);
    setIndex(indexAt(next));
  };

  const ready = viewport > 0 && layouts.length > 0;
  const synced = useRef(false);
  useEffect(() => {
    const target = targetOf(index);
    if (!ready || target === undefined) return;
    if (!synced.current) {
      synced.current = true;
      if (target > 0) scrollToOffset(target, false);
    } else if (indexProp !== undefined && Math.abs(offset - target) > 1) {
      scrollToOffset(target);
    }
  }, [ready, indexProp, layouts.length]);

  const value: CarouselContextValue = {
    orientation,
    snap,
    align,
    gap: gapSize,
    viewport,
    index,
    count: layouts.length,
    canScrollPrev: offset > 1,
    canScrollNext: max > 0 && offset < max - 1,
    scrollTo: (i, animated = true) => {
      const target = targetOf(i);
      if (target === undefined) return;
      setIndex(i);
      scrollToOffset(target, animated);
    },
    scrollPrev: () => step(-1),
    scrollNext: () => step(1),
    scrollRef,
    snapPoints: points,
    setViewport,
    setContentSize,
    handleScroll: setOffset,
    handleScrollEnd: (end) => setIndex(indexAt(end)),
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

export function CarouselContent({ style, contentContainerStyle, children, onLayout, onContentSizeChange, onScroll, onMomentumScrollEnd, ref, ...props }: CarouselContentProps) {
  const c = useCarousel();
  const horizontal = c.orientation === 'horizontal';
  const items = Children.toArray(children);
  const axis = (e: { nativeEvent: { contentOffset: { x: number; y: number } } }) => (horizontal ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y);
  const snapProps = c.snap ? { snapToOffsets: c.snapPoints, decelerationRate: 'fast' as const, disableIntervalMomentum: true } : {};
  return (
    <ScrollView
      ref={mergeRefs(c.scrollRef, ref)}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      nestedScrollEnabled
      {...snapProps}
      style={style}
      contentContainerStyle={[{ flexDirection: horizontal ? 'row' : 'column', gap: c.gap }, contentContainerStyle]}
      onLayout={(e) => {
        c.setViewport(horizontal ? e.nativeEvent.layout.width : e.nativeEvent.layout.height);
        onLayout?.(e);
      }}
      onContentSizeChange={(width, height) => {
        c.setContentSize(horizontal ? width : height);
        onContentSizeChange?.(width, height);
      }}
      onScroll={(e) => {
        c.handleScroll(axis(e));
        onScroll?.(e);
      }}
      onMomentumScrollEnd={(e) => {
        c.handleScrollEnd(axis(e));
        onMomentumScrollEnd?.(e);
      }}
      {...props}
    >
      {items.map((child, i) => (
        <CarouselItemContext.Provider key={i} value={{ index: i, count: items.length }}>
          {child}
        </CarouselItemContext.Provider>
      ))}
    </ScrollView>
  );
}

export function CarouselItem({ basis = 1, style, children, onLayout, ...props }: CarouselItemProps) {
  const c = useCarousel();
  const slot = useContext(CarouselItemContext);
  const horizontal = c.orientation === 'horizontal';
  const size = c.viewport > 0 ? (basis <= 1 ? basis * c.viewport : basis) : undefined;
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <View
      role="group"
      accessibilityLabel={slot ? `${slot.index + 1} of ${slot.count}` : undefined}
      style={[horizontal ? { width: size } : { height: size }, style]}
      onLayout={(e) => {
        if (slot) {
          const { x, y, width, height } = e.nativeEvent.layout;
          c.registerItem(slot.index, horizontal ? { start: x, size: width } : { start: y, size: height });
        }
        onLayout?.(e);
      }}
      {...props}
    >
      {content}
    </View>
  );
}

const flip = () => (I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined);

const edge = (side: 'prev' | 'next', horizontal: boolean) => {
  const inset = 8;
  if (horizontal) return { position: 'absolute', top: '50%', marginTop: -18, ...(side === 'prev' ? { start: inset } : { end: inset }) } as const;
  return { position: 'absolute', start: '50%', marginStart: -18, ...(side === 'prev' ? { top: inset } : { bottom: inset }) } as const;
};

export function CarouselPrevious({ variant = 'outline', size = 'icon', style, onPress, ...props }: ButtonProps) {
  const c = useCarousel();
  const horizontal = c.orientation === 'horizontal';
  return (
    <Button
      variant={variant}
      size={size}
      accessibilityLabel="Previous slide"
      disabled={!c.canScrollPrev}
      style={[edge('prev', horizontal), style]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        c.scrollPrev();
      }}
    >
      <Icon icon={horizontal ? ChevronLeft : ChevronUp} size={16} style={horizontal ? flip() : undefined} />
    </Button>
  );
}

export function CarouselNext({ variant = 'outline', size = 'icon', style, onPress, ...props }: ButtonProps) {
  const c = useCarousel();
  const horizontal = c.orientation === 'horizontal';
  return (
    <Button
      variant={variant}
      size={size}
      accessibilityLabel="Next slide"
      disabled={!c.canScrollNext}
      style={[edge('next', horizontal), style]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        c.scrollNext();
      }}
    >
      <Icon icon={horizontal ? ChevronRight : ChevronDown} size={16} style={horizontal ? flip() : undefined} />
    </Button>
  );
}
