import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { createStyles } from '@/registry/marcn/ui/item/styles';
import type { ItemSize, ItemVariant } from '@/registry/marcn/ui/item/types';

export * from '@/registry/marcn/ui/item/types';
export * from '@/registry/marcn/ui/item/parts';

export type ItemProps = ViewProps & {
  variant?: ItemVariant;
  size?: ItemSize;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export function Item({ variant = 'default', size = 'default', style, render, ...props }: ItemProps) {
  const s = useStyles(createStyles);
  const sizeStyle = size === 'sm' ? s.sizeSm : s.sizeDefault;
  return renderElement(View, render, { style: [s.item, s[variant], sizeStyle, style], ...props } as ViewProps);
}
