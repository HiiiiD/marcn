import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useTabs } from '@/registry/marcn/ui/tabs/context';
import { createStyles } from '@/registry/marcn/ui/tabs/styles';

export type TabsListProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function TabsList({ render, style, ...props }: TabsListProps) {
  const s = useStyles(createStyles);
  const { orientation } = useTabs();
  return renderElement(View, render, {
    accessibilityRole: 'tablist',
    style: [s.layout.list, orientation === 'vertical' && s.layout.listVertical, style],
    ...props,
  } as ViewProps);
}
