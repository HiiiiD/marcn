import { createContext, useContext, type ReactNode, type Ref } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  useCollapsible,
  type CollapsibleContentProps,
  type CollapsibleProps,
  type CollapsibleTriggerProps,
} from '@/registry/marcn/ui/collapsible';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';

type AccordionContextValue = { isOpen: (value: string) => boolean; toggle: (value: string, open: boolean) => void; disabled: boolean };
const AccordionContext = createContext<AccordionContextValue | null>(null);

const createStyles = (t: Theme) => ({
  layout: StyleSheet.create({
    root: { overflow: 'hidden' },
    // The last item's bottom border is pushed out of the clipped root, like `last:border-b-0`.
    inner: { marginBottom: -1 },
    item: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
    trigger: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.spacing[4], paddingVertical: t.spacing[4] },
    content: { paddingBottom: t.spacing[4] },
    disabled: { opacity: 0.5 },
    rotated: { transform: [{ rotate: '180deg' }] },
  }),
  triggerText: { flex: 1, fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.foreground },
  contentText: { fontSize: t.fontSize.sm, color: t.colors.foreground },
});

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

export type AccordionItemProps = Omit<CollapsibleProps, 'open' | 'defaultOpen' | 'onOpenChange'> & { value: string };

export function AccordionItem({ value, disabled, style, ...props }: AccordionItemProps) {
  const s = useStyles(createStyles);
  const root = useContext(AccordionContext);
  if (!root) throw new Error('AccordionItem must be used within an Accordion');
  return (
    <Collapsible
      open={root.isOpen(value)}
      onOpenChange={(next) => root.toggle(value, next)}
      disabled={disabled || root.disabled}
      style={[s.layout.item, style]}
      {...props}
    />
  );
}

export type AccordionTriggerProps = Omit<CollapsibleTriggerProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; children?: ReactNode };

export function AccordionTrigger({ children, style, ...props }: AccordionTriggerProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { open, disabled } = useCollapsible();
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.triggerText}>
      <CollapsibleTrigger style={[s.layout.trigger, disabled && s.layout.disabled, style]} {...props}>
        {content}
        <Icon icon={ChevronDown} color={colors.mutedForeground} style={open ? s.layout.rotated : undefined} />
      </CollapsibleTrigger>
    </TextStyleContext.Provider>
  );
}

export function AccordionContent({ children, style, ...props }: CollapsibleContentProps) {
  const s = useStyles(createStyles);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.contentText}>
      <CollapsibleContent style={[s.layout.content, style]} {...props}>
        {content}
      </CollapsibleContent>
    </TextStyleContext.Provider>
  );
}
