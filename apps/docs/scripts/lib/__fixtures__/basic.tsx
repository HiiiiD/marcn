import type { Ref } from 'react';
import type { PressableProps, View } from 'react-native';

export type FxVariant = 'default' | 'ghost';
export type FxProps = Omit<PressableProps, 'style'> & {
  /** Visual style. */
  variant?: FxVariant;
  /** @default 'md' */
  size?: 'sm' | 'md';
  render?: (props: PressableProps) => unknown;
  ref?: Ref<View>;
};

export function Fx({ variant = 'default', size, ...props }: FxProps) {
  return null;
}
export function Empty() {
  return null;
}
export function useThing() {}
export const NOT_A_COMPONENT = 1;
