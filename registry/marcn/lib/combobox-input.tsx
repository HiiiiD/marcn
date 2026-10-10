import { useState, type Ref } from 'react';
import {
  Pressable, StyleSheet, TextInput, View, type PressableProps, type StyleProp, type TextInputProps, type ViewStyle,
} from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { useCombobox } from '@/registry/marcn/lib/combobox-state';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';

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
  });

export type ComboboxFieldProps = { disabled?: boolean; 'aria-invalid'?: boolean };

// Shared by the inline input and the chips input: typing, focus and tapping open the list.
export function useComboboxInputProps({ disabled, ...props }: TextInputProps & ComboboxFieldProps & { ref?: Ref<TextInput> }) {
  const { colors } = useTheme();
  const combobox = useCombobox();
  const off = disabled || combobox.disabled;
  const { onChangeText, onFocus, onPressIn, onSubmitEditing, ref, ...rest } = props;
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
      onFocus: (e) => {
        combobox.setOpen(true);
        onFocus?.(e);
      },
      // A focused input fires no focus again: this reopens it after Back hid the popup.
      onPressIn: (e) => {
        combobox.setOpen(true);
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

export type ComboboxInputProps = TextInputProps &
  ComboboxFieldProps & {
    showTrigger?: boolean;
    showClear?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    ref?: Ref<TextInput>;
  };

export function ComboboxInput({
  showTrigger = true, showClear, containerStyle, style, onBlur, 'aria-invalid': invalid, disabled, ref, ...rest
}: ComboboxInputProps) {
  const s = useStyles(createFieldStyles);
  const combobox = useCombobox();
  const [focused, setFocused] = useState(false);
  const { off, props } = useComboboxInputProps({ ...rest, disabled, ref, onFocus: (e) => { setFocused(true); rest.onFocus?.(e); } });
  const hasContent = combobox.selected.length > 0 || combobox.inputValue !== '';
  return (
    <View
      ref={combobox.anchorRef}
      testID="combobox-anchor"
      style={[s.field, focused && s.focused, invalid === true && s.invalid, off && s.disabled, containerStyle]}
    >
      <TextInput
        {...props}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[s.input, style]}
      />
      {showClear && hasContent && !off ? <ComboboxClear /> : null}
      {showTrigger ? <ComboboxTrigger /> : null}
    </View>
  );
}

export type ComboboxTriggerProps = Omit<PressableProps, 'children'>;

export function ComboboxTrigger({ disabled, onPress, ...props }: ComboboxTriggerProps) {
  const s = useStyles(createFieldStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  const off = disabled || combobox.disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Show options"
      accessibilityState={{ expanded: combobox.open, disabled: !!off }}
      disabled={off}
      hitSlop={6}
      style={({ pressed }) => [s.button, pressed && s.pressed]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        if (combobox.open) {
          combobox.setOpen(false);
          return;
        }
        combobox.setOpen(true);
        combobox.inputRef.current?.focus();
      }}
    >
      <Icon icon={ChevronDown} color={colors.mutedForeground} />
    </Pressable>
  );
}

export type ComboboxClearProps = Omit<PressableProps, 'children'>;

export function ComboboxClear({ disabled, onPress, ...props }: ComboboxClearProps) {
  const s = useStyles(createFieldStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Clear"
      disabled={disabled || combobox.disabled}
      hitSlop={6}
      style={({ pressed }) => [s.button, pressed && s.pressed]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        combobox.clear();
        combobox.inputRef.current?.focus();
      }}
    >
      <Icon icon={X} color={colors.mutedForeground} />
    </Pressable>
  );
}
