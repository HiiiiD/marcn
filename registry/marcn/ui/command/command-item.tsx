import { useContext, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { MenuItemRow, type MenuItemRowProps } from '@/registry/marcn/ui/menu/menu-item';
import { useStyles } from '@/registry/marcn/lib/theme';
import { GroupIdContext, useCommand } from '@/registry/marcn/ui/command/context';
import { itemText } from '@/registry/marcn/ui/command/rank-children';
import { createStyles } from '@/registry/marcn/ui/command/styles';

export type CommandItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant' | 'children' | 'disabled'> & {
  children?: ReactNode;
  disabled?: boolean;
  value?: string;
  keywords?: readonly string[];
  onSelect?: (value: string) => void;
};

export function CommandItem({ value, keywords, onSelect, disabled, style, children, ...props }: CommandItemProps) {
  const s = useStyles(createStyles);
  const command = useCommand();
  const groupId = useContext(GroupIdContext);
  const id = useId();
  const text = itemText({ value, children });
  const latestSelect = useRef(onSelect);
  latestSelect.current = onSelect;
  // Stands in for `keywords`, whose array identity changes every render.
  const keywordsKey = keywords?.join('\u0000');
  const { register } = command;

  useLayoutEffect(
    () => register(id, { value: text, keywords, disabled, groupId, run: () => latestSelect.current?.(text) }),
    [register, id, text, keywordsKey, disabled, groupId],
  );

  if (command.scoreOf(text, keywords) <= 0) return null;
  return (
    <MenuItemRow
      role="menuitem"
      disabled={disabled}
      onPress={() => onSelect?.(text)}
      style={[command.bestId === id && s.best, style]}
      {...props}
    >
      {children}
    </MenuItemRow>
  );
}

CommandItem.commandKind = 'item' as const;
