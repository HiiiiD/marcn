import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { TabsContext, type Orientation } from '@/registry/marcn/ui/tabs/context';
import { createStyles } from '@/registry/marcn/ui/tabs/styles';

export * from '@/registry/marcn/ui/tabs/list';
export * from '@/registry/marcn/ui/tabs/trigger';
export * from '@/registry/marcn/ui/tabs/content';

export type TabsProps = ViewProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  // Accepted for shadcn parity; touch has no focus step, so both modes select on press.
  activationMode?: 'automatic' | 'manual';
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export function Tabs({ value, defaultValue = '', onValueChange, orientation = 'horizontal', activationMode: _activationMode, render, style, ...props }: TabsProps) {
  const s = useStyles(createStyles);
  const [current, setValue] = useControllableState({ value, defaultValue, onChange: onValueChange });
  return (
    <TabsContext.Provider value={{ value: current, setValue, orientation }}>
      {renderElement(View, render, { style: [s.layout.root, orientation === 'vertical' && s.layout.rootVertical, style], ...props } as ViewProps)}
    </TabsContext.Provider>
  );
}
