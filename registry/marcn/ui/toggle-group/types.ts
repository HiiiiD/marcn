import type { ReactNode, Ref } from 'react';
import type { View, ViewProps } from 'react-native';
import type { RenderProp } from '@/registry/marcn/lib/render';
import type { ToggleProps, ToggleSize, ToggleVariant } from '@/registry/marcn/ui/toggle';

export type Loose = Omit<ViewProps, 'children'> & {
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

export type ToggleGroupItemProps = Omit<ToggleProps, 'pressed' | 'defaultPressed' | 'onPressedChange'> & { value: string };
