import { createContext, useContext, type RefObject } from 'react';
import type { ScrollView } from 'react-native';
import type { CarouselAlign } from '@/registry/marcn/lib/carousel-math';

export type ItemLayout = { start: number; size: number };

export type CarouselContextValue = {
  orientation: 'horizontal' | 'vertical';
  snap: boolean;
  align: CarouselAlign;
  gap: number;
  viewport: number;
  index: number;
  count: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number, animated?: boolean) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollRef: RefObject<ScrollView | null>;
  snapPoints: number[];
  setViewport: (size: number) => void;
  setContentSize: (size: number) => void;
  handleScroll: (offset: number) => void;
  handleScrollEnd: (offset: number) => void;
  registerItem: (index: number, layout: ItemLayout) => void;
};

export const CarouselContext = createContext<CarouselContextValue | null>(null);
export const CarouselItemContext = createContext<{ index: number; count: number } | null>(null);

export function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within <Carousel>');
  return context;
}
