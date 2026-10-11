import type { ReactNode, Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type PressableProps, type StyleProp, type TextInputProps, type ViewProps, type ViewStyle } from 'react-native';
import { X } from 'lucide-react-native';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, TextStyleContext, type TextProps } from '@/registry/marcn/ui/text';
import { useCombobox } from '@/registry/marcn/ui/combobox/context';
import { createFieldStyles, useComboboxInputProps, type ComboboxFieldProps } from '@/registry/marcn/ui/combobox/input-props';
import type { ComboboxOption } from '@/registry/marcn/ui/combobox/types';

const createChipsStyles = (t: Theme) => ({
  base: StyleSheet.create({
    chips: { flexWrap: 'wrap', gap: t.spacing[1], paddingHorizontal: t.spacing[2], paddingVertical: 3 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing[1],
      height: 26,
      paddingLeft: t.spacing[2],
      paddingRight: 2,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.secondary,
    },
    chipOnly: { paddingRight: t.spacing[2] },
    remove: { width: 20, height: 20, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center' },
    input: { flexGrow: 1, flexBasis: 72, minWidth: 72, height: 26, paddingVertical: 0, paddingHorizontal: t.spacing[1], fontSize: t.fontSize.base },
    value: { flexShrink: 1, fontSize: t.fontSize.sm },
    placeholder: { color: t.colors.mutedForeground },
  }),
  chipText: { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.medium, color: t.colors.secondaryForeground },
});

export type ComboboxChipsProps = Omit<PressableProps, 'style' | 'children'> &
  Pick<ComboboxFieldProps, 'aria-invalid'> & { style?: StyleProp<ViewStyle>; children?: ReactNode; ref?: Ref<View> };

export function ComboboxChips({ style, 'aria-invalid': invalid, children, ref, ...props }: ComboboxChipsProps) {
  const f = useStyles(createFieldStyles);
  const s = useStyles(createChipsStyles).base;
  const combobox = useCombobox();
  const off = combobox.disabled;
  return (
    <Pressable
      ref={mergeRefs(ref, combobox.anchorRef)}
      testID="combobox-anchor"
      onLayout={combobox.bumpAnchor}
      accessible={false}
      disabled={off}
      onPress={() => {
        combobox.setOpen(true);
        combobox.inputRef.current?.focus();
      }}
      style={[f.field, s.chips, combobox.open && f.focused, invalid === true && f.invalid, off && f.disabled, style]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export type ComboboxChipProps = ViewProps & { value: string; showRemove?: boolean; children?: ReactNode };

export function ComboboxChip({ value, showRemove = true, style, children, ...props }: ComboboxChipProps) {
  const styles = useStyles(createChipsStyles);
  const s = styles.base;
  const { colors } = useTheme();
  const combobox = useCombobox();
  const removable = showRemove && !combobox.disabled;
  return (
    <TextStyleContext.Provider value={styles.chipText}>
      <View style={[s.chip, !removable && s.chipOnly, style]} {...props}>
        {typeof children === 'string' || typeof children === 'number' || children === undefined ? <Text>{children ?? combobox.labelOf(value)}</Text> : children}
        {removable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${combobox.labelOf(value)}`}
            hitSlop={6}
            style={s.remove}
            onPress={() => combobox.remove(value)}
          >
            <Icon icon={X} size={12} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
    </TextStyleContext.Provider>
  );
}

export type ComboboxChipsInputProps = TextInputProps & { ref?: Ref<TextInput> };

export function ComboboxChipsInput({ style, onKeyPress, ...rest }: ComboboxChipsInputProps) {
  const s = useStyles(createChipsStyles).base;
  const f = useStyles(createFieldStyles);
  const combobox = useCombobox();
  const { props } = useComboboxInputProps(rest);
  return (
    <TextInput
      {...props}
      onKeyPress={(e) => {
        if (e.nativeEvent.key === 'Backspace' && combobox.inputValue === '') combobox.removeLast();
        onKeyPress?.(e);
      }}
      style={[f.input, s.input, style]}
    />
  );
}

export type ComboboxValueProps = Omit<TextProps, 'children'> & {
  placeholder?: string;
  children?: (selected: ComboboxOption[]) => ReactNode;
};

export function ComboboxValue({ placeholder, style, children, ...props }: ComboboxValueProps) {
  const s = useStyles(createChipsStyles).base;
  const { selected } = useCombobox();
  if (children) return <>{children(selected)}</>;
  const empty = selected.length === 0;
  return (
    <Text numberOfLines={1} style={[s.value, empty && s.placeholder, style]} {...props}>
      {empty ? placeholder : selected.map((o) => o.label).join(', ')}
    </Text>
  );
}
