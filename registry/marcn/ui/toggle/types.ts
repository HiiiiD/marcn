import type { Ref } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import type { RenderProp } from '@/registry/marcn/lib/render';

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'default' | 'sm' | 'lg';
export type ToggleState = { on: boolean; pressed: boolean; disabled: boolean };
export type ToggleProps = Omit<PressableProps, 'style'> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, ToggleState>;
  ref?: Ref<View>;
};
