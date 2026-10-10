import { createContext, useContext, type Ref } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';

type Orientation = 'horizontal' | 'vertical';
type TabsContextValue = { value: string; setValue: (value: string) => void; orientation: Orientation };
const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs parts must be used within Tabs');
  return ctx;
}

const createStyles = (t: Theme) => {
  const text = { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium };
  return {
    layout: StyleSheet.create({
      root: { gap: t.spacing[2] },
      rootVertical: { flexDirection: 'row' },
      list: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', padding: 3, borderRadius: t.radius.lg, backgroundColor: t.colors.muted },
      listVertical: { flexDirection: 'column', alignItems: 'stretch' },
      trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: t.spacing[2],
        paddingVertical: t.spacing[1] + 1,
        borderRadius: t.radius.md,
      },
      selected: { backgroundColor: t.colors.background },
      disabled: { opacity: 0.5 },
    }),
    text: StyleSheet.create({
      selected: { ...text, color: t.colors.foreground },
      idle: { ...text, color: t.colors.mutedForeground },
    }),
  };
};

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

export type TabsTriggerState = { selected: boolean; disabled: boolean };
export type TabsTriggerProps = Omit<PressableProps, 'style'> & {
  value: string;
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, TabsTriggerState>;
  ref?: Ref<View>;
};

export function TabsTrigger({ value, style, disabled, render, children, onPress, ...props }: TabsTriggerProps) {
  const s = useStyles(createStyles);
  const ctx = useTabs();
  const selected = ctx.value === value;
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={selected ? s.text.selected : s.text.idle}>
      {renderElement(
        Pressable,
        render,
        {
          accessibilityRole: 'tab',
          accessibilityState: { selected, disabled: !!disabled },
          disabled,
          style: [s.layout.trigger, selected && s.layout.selected, disabled && s.layout.disabled, style],
          ...props,
          onPress: (e) => {
            onPress?.(e);
            ctx.setValue(value);
          },
          children: content,
        } as PressableProps,
        { selected, disabled: !!disabled },
      )}
    </TextStyleContext.Provider>
  );
}

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
