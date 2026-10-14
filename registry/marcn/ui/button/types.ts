import type { Ref } from 'react';
import type { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import type { RenderProp } from '@/registry/marcn/lib/render';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'inline';
export type ButtonState = { pressed: boolean; disabled: boolean };
export type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, ButtonState>;
  ref?: Ref<View>;
};
