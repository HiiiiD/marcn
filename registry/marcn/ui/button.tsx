import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { TextStyleContext } from '@/registry/marcn/ui/text';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
export type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
};

const createStyles = (t: Theme) => {
  const text = { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium };
  return {
    base: StyleSheet.create({
      root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], borderRadius: t.radius.md },
      disabled: { opacity: 0.5 },
    }),
    variant: StyleSheet.create({
      default: { backgroundColor: t.colors.primary },
      destructive: { backgroundColor: t.colors.destructive },
      outline: { backgroundColor: t.colors.background, borderWidth: 1, borderColor: t.colors.border },
      secondary: { backgroundColor: t.colors.secondary },
      ghost: {},
      link: {},
    }),
    pressed: StyleSheet.create({
      default: { opacity: 0.9 },
      destructive: { opacity: 0.9 },
      outline: { backgroundColor: t.colors.accent },
      secondary: { opacity: 0.8 },
      ghost: { backgroundColor: t.colors.accent },
      link: { opacity: 0.7 },
    }),
    size: StyleSheet.create({
      default: { height: 36, paddingHorizontal: t.spacing[4] },
      sm: { height: 32, paddingHorizontal: t.spacing[3] },
      lg: { height: 40, paddingHorizontal: t.spacing[6] },
      icon: { height: 36, width: 36 },
    }),
    text: StyleSheet.create({
      default: { ...text, color: t.colors.primaryForeground },
      destructive: { ...text, color: t.colors.destructiveForeground },
      outline: { ...text, color: t.colors.foreground },
      secondary: { ...text, color: t.colors.secondaryForeground },
      ghost: { ...text, color: t.colors.foreground },
      link: { ...text, color: t.colors.primary, textDecorationLine: 'underline' },
    }),
  };
};

export function Button({ variant = 'default', size = 'default', style, disabled, children, ...props }: ButtonProps) {
  const s = useStyles(createStyles);
  return (
    <TextStyleContext.Provider value={s.text[variant]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        style={({ pressed }) => [
          s.base.root,
          s.variant[variant],
          s.size[size],
          pressed && s.pressed[variant],
          disabled && s.base.disabled,
          style,
        ]}
        {...props}
      >
        {children}
      </Pressable>
    </TextStyleContext.Provider>
  );
}
