import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';

export type AspectRatioProps = ViewProps & { ratio?: number; render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function AspectRatio({ ratio = 1, style, render, ...props }: AspectRatioProps) {
  return renderElement(View, render, { style: [{ width: '100%', aspectRatio: ratio }, style], ...props } as ViewProps);
}
