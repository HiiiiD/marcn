import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useTabs } from '@/registry/marcn/ui/tabs/context';

export type TabsContentProps = ViewProps & { value: string; forceMount?: boolean; render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function TabsContent({ value, forceMount, render, ...props }: TabsContentProps) {
  const ctx = useTabs();
  const active = ctx.value === value;
  if (!active && !forceMount) return null;
  return renderElement(View, render, {
    accessibilityElementsHidden: !active,
    importantForAccessibility: active ? 'auto' : 'no-hide-descendants',
    ...props,
  } as ViewProps);
}
