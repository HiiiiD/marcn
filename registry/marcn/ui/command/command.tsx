import type { ReactNode, Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { CommandContext } from '@/registry/marcn/ui/command/context';
import { createStyles } from '@/registry/marcn/ui/command/styles';
import { useCommandState, type CommandStateOptions } from '@/registry/marcn/ui/command/use-command-state';

export type CommandProps = Omit<ViewProps, 'children'> &
  CommandStateOptions & {
    children?: ReactNode;
    render?: RenderProp<ViewProps>;
    ref?: Ref<View>;
  };

export function Command({ value, defaultValue, onValueChange, filter, shouldFilter, render, style, ...props }: CommandProps) {
  const s = useStyles(createStyles);
  const ctx = useCommandState({ value, defaultValue, onValueChange, filter, shouldFilter });
  return (
    <CommandContext.Provider value={ctx}>
      {renderElement(View, render, { style: [s.root, style], ...props } as ViewProps)}
    </CommandContext.Provider>
  );
}
