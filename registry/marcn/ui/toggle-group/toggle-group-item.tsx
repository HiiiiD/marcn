import { useContext } from 'react';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Toggle } from '@/registry/marcn/ui/toggle';
import { GroupContext } from '@/registry/marcn/ui/toggle-group/context';
import { createStyles } from '@/registry/marcn/ui/toggle-group/styles';
import type { ToggleGroupItemProps } from '@/registry/marcn/ui/toggle-group/types';

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
