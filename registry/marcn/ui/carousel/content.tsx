import { Children, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { CarouselItemContext, useCarousel } from '@/registry/marcn/ui/carousel/context';
import type { CarouselContentProps } from '@/registry/marcn/ui/carousel/types';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { Text } from '@/registry/marcn/ui/text';

export function CarouselContent({ style, contentContainerStyle, children, onLayout, onContentSizeChange, onScroll, onMomentumScrollEnd, onScrollEndDrag, ref, ...props }: CarouselContentProps) {
  const c = useCarousel();
  const horizontal = c.orientation === 'horizontal';
  const items = Children.toArray(children);
  useEffect(() => c.setCount(items.length), [items.length]);
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
      onScrollEndDrag={(e) => {
        // iOS fires no momentum end when a drag is released at rest.
        const velocity = e.nativeEvent.velocity;
        if (velocity && Math.abs(horizontal ? velocity.x : velocity.y) < 0.05) c.handleScrollEnd(axis(e));
        onScrollEndDrag?.(e);
      }}
      {...props}
    >
      {items.map((child, i) => (
        <CarouselItemContext.Provider key={i} value={{ index: i, count: items.length }}>
          {typeof child === 'string' || typeof child === 'number' ? <Text>{child}</Text> : child}
        </CarouselItemContext.Provider>
      ))}
    </ScrollView>
  );
}
