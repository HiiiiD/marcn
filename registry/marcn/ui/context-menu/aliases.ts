import { MenuLabel, MenuSeparator, MenuShortcut } from '@/registry/marcn/ui/menu/menu-item';
import {
  MenuCheckboxItem, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem,
  type MenuCheckboxItemProps, type MenuItemProps, type MenuRadioGroupProps, type MenuRadioItemProps, type MenuSelectEvent,
} from '@/registry/marcn/ui/menu/menu-parts';

export const ContextMenuGroup = MenuGroup;
export const ContextMenuItem = MenuItem;
export const ContextMenuCheckboxItem = MenuCheckboxItem;
export const ContextMenuRadioGroup = MenuRadioGroup;
export const ContextMenuRadioItem = MenuRadioItem;
export const ContextMenuLabel = MenuLabel;
export const ContextMenuSeparator = MenuSeparator;
export const ContextMenuShortcut = MenuShortcut;
export type ContextMenuItemProps = MenuItemProps;
export type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;
export type ContextMenuRadioGroupProps = MenuRadioGroupProps;
export type ContextMenuRadioItemProps = MenuRadioItemProps;
export type { MenuSelectEvent };
