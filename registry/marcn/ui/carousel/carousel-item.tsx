import { useContext } from 'react';
import { View } from 'react-native';
import { CarouselItemContext, useCarousel } from '@/registry/marcn/ui/carousel/context';
import type { CarouselItemProps } from '@/registry/marcn/ui/carousel/types';
import { Text } from '@/registry/marcn/ui/text';

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
