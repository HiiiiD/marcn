import { I18nManager } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useCarousel } from '@/registry/marcn/ui/carousel/context';
import { Button, type ButtonProps } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';

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
