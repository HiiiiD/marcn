import { createContext, useContext, type ReactNode, type Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Toggle, type ToggleProps, type ToggleSize, type ToggleVariant } from '@/registry/marcn/ui/toggle';

type GroupContextValue = {
  isOn: (value: string) => boolean;
  toggle: (value: string) => void;
  variant: ToggleVariant;
  size: ToggleSize;
  disabled: boolean;
  joined: boolean;
};
const GroupContext = createContext<GroupContextValue | null>(null);

const createStyles = (t: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    joined: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: t.radius.md },
    joinedOutline: { borderWidth: 1, borderColor: t.colors.input },
    // The first item's left border is shifted out of the clipped root so only the separators between items remain.
    joinedRowOutline: { marginLeft: -1 },
    joinedItem: { borderRadius: 0 },
    joinedItemOutline: { borderWidth: 0, borderLeftWidth: 1 },
  });

type Loose = Omit<ViewProps, 'children'> & {
  children?: ReactNode;
  type: 'single' | 'multiple';
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  spacing?: number;
  disabled?: boolean;
  render?: RenderProp<ViewProps>;
};

export type ToggleGroupProps = Omit<ViewProps, 'children'> & {
  children?: ReactNode;
  variant?: ToggleVariant;
  size?: ToggleSize;
  spacing?: number;
  disabled?: boolean;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
} & (
    | { type: 'single'; value?: string; defaultValue?: string; onValueChange?: (value: string) => void }
    | { type: 'multiple'; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

const toArray = (value: string | string[] | undefined) => (value === undefined || value === '' ? [] : Array.isArray(value) ? value : [value]);

export function ToggleGroup(allProps: ToggleGroupProps) {
  const { type, value, defaultValue, onValueChange, variant = 'default', size = 'default', spacing = 0, disabled = false, render, style, children, ...props } = allProps as Loose;
  const s = useStyles(createStyles);
  const single = type === 'single';
  const [selected, setSelected] = useControllableState<string[]>({
    value: value === undefined ? undefined : toArray(value),
    defaultValue: toArray(defaultValue),
    onChange: (next) => onValueChange?.(single ? (next[0] ?? '') : next),
  });
  const joined = spacing === 0;
  const outline = variant === 'outline';

  const toggle = (item: string) => {
    const on = selected.includes(item);
    if (single) return setSelected(on ? [] : [item]);
    setSelected(on ? selected.filter((v) => v !== item) : [...selected, item]);
  };

  return (
    <GroupContext.Provider value={{ isOn: (v) => selected.includes(v), toggle, variant, size, disabled, joined }}>
      {renderElement(View, render, {
        ...props,
        style: [joined && s.joined, joined && outline && s.joinedOutline, style],
        children: <View style={[s.row, joined && outline && s.joinedRowOutline, !joined && { gap: spacing * 4 }]}>{children}</View>,
      } as ViewProps)}
    </GroupContext.Provider>
  );
}

export type ToggleGroupItemProps = Omit<ToggleProps, 'pressed' | 'defaultPressed' | 'onPressedChange'> & { value: string };

export function ToggleGroupItem({ value, style, disabled, ...props }: ToggleGroupItemProps) {
  const s = useStyles(createStyles);
  const group = useContext(GroupContext);
  if (!group) throw new Error('ToggleGroupItem must be used within a ToggleGroup');
  const outline = (props.variant ?? group.variant) === 'outline';
  return (
    <Toggle
      variant={group.variant}
      size={group.size}
      pressed={group.isOn(value)}
      onPressedChange={() => group.toggle(value)}
      disabled={disabled || group.disabled}
      style={[group.joined && s.joinedItem, group.joined && outline && s.joinedItemOutline, style]}
      {...props}
    />
  );
}
