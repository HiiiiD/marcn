import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { AccordionContext } from '@/registry/marcn/ui/accordion/context';
import { createStyles } from '@/registry/marcn/ui/accordion/styles';

export * from '@/registry/marcn/ui/accordion/accordion-item';
export * from '@/registry/marcn/ui/accordion/trigger';
export * from '@/registry/marcn/ui/accordion/content';

type Loose = ViewProps & {
  type: 'single' | 'multiple';
  collapsible?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
  disabled?: boolean;
  render?: RenderProp<ViewProps>;
};

export type AccordionProps = Omit<ViewProps, 'children'> & {
  children?: ViewProps['children'];
  disabled?: boolean;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
} & (
    | { type: 'single'; collapsible?: boolean; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
    | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

const toArray = (value: string | string[] | undefined) => (value === undefined || value === '' ? [] : Array.isArray(value) ? value : [value]);

export function Accordion(allProps: AccordionProps) {
  const { type, collapsible, value, defaultValue, onValueChange, disabled = false, render, style, children, ...props } = allProps as Loose;
  const s = useStyles(createStyles);
  const single = type === 'single';
  const [open, setOpen] = useControllableState<string[]>({
    value: value === undefined ? undefined : toArray(value),
    defaultValue: toArray(defaultValue),
    onChange: (next) => onValueChange?.(single ? (next[0] ?? '') : next),
  });

  const toggle = (item: string, next: boolean) => {
    if (!single) return setOpen(next ? [...open, item] : open.filter((v) => v !== item));
    if (next) return setOpen([item]);
    if (collapsible) setOpen([]);
  };

  return (
    <AccordionContext.Provider value={{ isOpen: (v) => open.includes(v), toggle, disabled }}>
      {renderElement(View, render, {
        ...props,
        style: [s.layout.root, style],
        children: <View style={s.layout.inner}>{children}</View>,
      } as ViewProps)}
    </AccordionContext.Provider>
  );
}
