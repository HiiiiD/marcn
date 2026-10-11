import type { Ref } from 'react';
import type { PressableProps, View, ViewProps } from 'react-native';
import type { ButtonProps } from '@/registry/marcn/ui/button';

export type InputGroupProps = ViewProps & { disabled?: boolean; ref?: Ref<View> };
export type InputGroupAddonAlign = 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
export type InputGroupAddonProps = Omit<PressableProps, 'style'> & { align?: InputGroupAddonAlign; style?: ViewProps['style'] };
export type InputGroupButtonSize = 'xs' | 'sm' | 'icon-xs' | 'icon-sm';
export type InputGroupButtonProps = Omit<ButtonProps, 'size'> & { size?: InputGroupButtonSize };
