import type { Ref } from 'react';
import { StyleSheet, type TextInput, type TextInputProps } from 'react-native';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { useCombobox } from '@/registry/marcn/ui/combobox/context';

export const createFieldStyles = (t: Theme) =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.input,
    },
    focused: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
    input: { flex: 1, height: 36, paddingVertical: 0, paddingHorizontal: t.spacing[3], fontSize: t.fontSize.base, color: t.colors.foreground },
    button: { width: 28, height: 28, marginRight: t.spacing[1], borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center' },
    pressed: { backgroundColor: t.colors.accent },
    inPopup: { margin: t.spacing[1] },
    trigger: { justifyContent: 'space-between', paddingLeft: t.spacing[3], paddingRight: t.spacing[2], gap: t.spacing[2] },
  });

export type ComboboxFieldProps = { disabled?: boolean; 'aria-invalid'?: boolean };

// Shared by the inline input and the chips input: typing and tapping open the list.
export function useComboboxInputProps({ disabled, ...props }: TextInputProps & ComboboxFieldProps & { ref?: Ref<TextInput> }) {
  const { colors } = useTheme();
  const combobox = useCombobox();
  const off = disabled || combobox.disabled;
  const { onChangeText, onPressIn, onSubmitEditing, ref, ...rest } = props;
  return {
    off,
    props: {
      ref: mergeRefs(ref, combobox.inputRef),
      value: combobox.inputValue,
      editable: !off,
      autoCorrect: false,
      autoCapitalize: 'none',
      // Stays focused on a miss (closing after a pick dismisses the keyboard). Gboard hides itself on "done".
      submitBehavior: 'submit',
      returnKeyType: 'search',
      placeholderTextColor: colors.mutedForeground,
      accessibilityRole: 'combobox',
      accessibilityLabel: props.placeholder,
      accessibilityState: { expanded: combobox.open, disabled: !!off },
      onChangeText: (text: string) => {
        combobox.typeText(text);
        onChangeText?.(text);
      },
      // Opens on touch, not focus: Android hands focus to the first input when a dialog closes.
      onPressIn: (e) => {
        if (!off) combobox.setOpen(true);
        onPressIn?.(e);
      },
      onSubmitEditing: (e) => {
        combobox.submit();
        onSubmitEditing?.(e);
      },
      ...rest,
    } as TextInputProps & { ref: Ref<TextInput> },
  };
}
