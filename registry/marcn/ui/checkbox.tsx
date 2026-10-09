import { Check, Minus } from 'lucide-react-native';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';

export type CheckboxProps = Omit<PressableProps, 'style' | 'children' | 'onPress'> & {
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

const createStyles = (t: Theme) =>
  StyleSheet.create({
    box: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.input,
      borderRadius: 4,
    },
    on: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    disabled: { opacity: 0.5 },
  });

export function Checkbox({ checked = false, onCheckedChange, disabled, style, ...props }: CheckboxProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const on = checked !== false;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: checked === 'indeterminate' ? 'mixed' : checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onCheckedChange?.(checked !== true)}
      style={[s.box, on && s.on, disabled && s.disabled, style]}
      {...props}
    >
      {on && <Icon icon={checked === 'indeterminate' ? Minus : Check} size={12} color={colors.primaryForeground} />}
    </Pressable>
  );
}
