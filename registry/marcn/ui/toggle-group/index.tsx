import { View, type ViewProps } from 'react-native';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { GroupContext } from '@/registry/marcn/ui/toggle-group/context';
import { createStyles } from '@/registry/marcn/ui/toggle-group/styles';
import type { Loose, ToggleGroupProps } from '@/registry/marcn/ui/toggle-group/types';

export type { ToggleGroupProps, ToggleGroupItemProps } from '@/registry/marcn/ui/toggle-group/types';
export { ToggleGroupItem } from '@/registry/marcn/ui/toggle-group/toggle-group-item';

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
