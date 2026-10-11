import type { Ref } from 'react';
import type { ScrollView, ScrollViewProps, View, ViewProps } from 'react-native';
import type { CarouselAlign } from '@/registry/marcn/ui/carousel/math';

export type CarouselProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  snap?: boolean;
  /** Where the active slide rests in the viewport. Only applies when `snap` is on. */
  align?: CarouselAlign;
  gap?: number;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  ref?: Ref<View>;
};
export type CarouselContentProps = Omit<ScrollViewProps, 'horizontal'> & { ref?: Ref<ScrollView> };
export type CarouselItemProps = ViewProps & { basis?: number; ref?: Ref<View> };
