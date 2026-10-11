import { Pressable, type PressableProps } from 'react-native';
import { X } from 'lucide-react-native';
import { useStyles, useTheme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { useCombobox } from '@/registry/marcn/ui/combobox/context';
import { createFieldStyles } from '@/registry/marcn/ui/combobox/input-props';

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
        combobox.setOpen(true);
        combobox.inputRef.current?.focus();
      }}
    >
      <Icon icon={X} color={colors.mutedForeground} />
    </Pressable>
  );
}
