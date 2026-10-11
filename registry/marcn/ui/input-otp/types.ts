import type { ReactNode, Ref } from 'react';
import type { TextInput, TextInputProps, View, ViewProps } from 'react-native';
import type { RenderProp } from '@/registry/marcn/lib/render';

export type InputOTPState = { value: string; focused: boolean; disabled: boolean; invalid: boolean; complete: boolean };
export type InputOTPSlotState = { char: string; active: boolean; filled: boolean; focused: boolean; invalid: boolean; disabled: boolean };

export type InputOTPProps = Omit<ViewProps, 'children'> &
  Pick<TextInputProps, 'onFocus' | 'onBlur' | 'autoFocus' | 'accessibilityLabel'> & {
    children?: ReactNode;
    maxLength: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    pattern?: RegExp;
    disabled?: boolean;
    'aria-invalid'?: boolean;
    inputRef?: Ref<TextInput>;
    render?: RenderProp<ViewProps, InputOTPState>;
    ref?: Ref<View>;
  };
