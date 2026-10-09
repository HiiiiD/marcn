import { useState, type Ref } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';

export type InputProps = TextInputProps & {
  disabled?: boolean;
  'aria-invalid'?: boolean;
  ref?: Ref<TextInput>;
};

const createStyles = (t: Theme) =>
  StyleSheet.create({
    input: {
      height: 36,
      borderWidth: 1,
      borderColor: t.colors.input,
      borderRadius: t.radius.md,
      paddingHorizontal: t.spacing[3],
      fontSize: t.fontSize.base,
      color: t.colors.foreground,
    },
    focused: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
  });

export function Input({ style, disabled, onFocus, onBlur, editable, 'aria-invalid': ariaInvalid, ...props }: InputProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const invalid = ariaInvalid === true;
  return (
    <TextInput
      placeholderTextColor={colors.mutedForeground}
      editable={disabled ? false : editable}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[s.input, focused && s.focused, invalid && s.invalid, disabled && s.disabled, style]}
      {...props}
    />
  );
}
