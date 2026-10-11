import { View, type ViewProps } from 'react-native';
import { MenuLabel, MenuSeparator } from '@/registry/marcn/ui/menu/menu-item';

export function SelectGroup(props: ViewProps) {
  return <View {...props} />;
}

export const SelectLabel = MenuLabel;
export const SelectSeparator = MenuSeparator;
