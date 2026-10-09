import { createContext, useContext } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';

type RadioContextValue = { value?: string; onValueChange?: (value: string) => void; disabled?: boolean };
const RadioContext = createContext<RadioContextValue | null>(null);

const createStyles = (t: Theme) =>
  StyleSheet.create({
    group: { gap: t.spacing[3] },
    radio: {
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.primary,
      borderRadius: t.radius.full,
    },
    dot: { width: 8, height: 8, borderRadius: t.radius.full, backgroundColor: t.colors.primary },
    disabled: { opacity: 0.5 },
  });

export type RadioGroupProps = ViewProps & RadioContextValue;

export function RadioGroup({ value, onValueChange, disabled, style, ...props }: RadioGroupProps) {
  const s = useStyles(createStyles);
  return (
    <RadioContext.Provider value={{ value, onValueChange, disabled }}>
      <View accessibilityRole="radiogroup" style={[s.group, style]} {...props} />
    </RadioContext.Provider>
  );
}

export type RadioGroupItemProps = Omit<PressableProps, 'style' | 'children' | 'onPress'> & {
  value: string;
  style?: StyleProp<ViewStyle>;
};

export function RadioGroupItem({ value, disabled, style, ...props }: RadioGroupItemProps) {
  const s = useStyles(createStyles);
  const { spacing } = useTheme();
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error('RadioGroupItem must be used within a RadioGroup');
  const selected = ctx.value === value;
  const isDisabled = disabled || ctx.disabled;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !!isDisabled }}
      disabled={isDisabled}
      hitSlop={spacing[3]}
      onPress={() => ctx.onValueChange?.(value)}
      style={[s.radio, isDisabled && s.disabled, style]}
      {...props}
    >
      {selected && <View style={s.dot} />}
    </Pressable>
  );
}
