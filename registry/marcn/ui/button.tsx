import { useState } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';
export type ButtonState = { pressed: boolean; disabled: boolean };
export type ButtonProps = Omit<PressableProps, 'style'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, ButtonState>;
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

export function Button({ variant = 'default', size = 'default', style, disabled, render, children, onPressIn, onPressOut, ...props }: ButtonProps) {
  const s = useStyles(createStyles);
  const [pressed, setPressed] = useState(false);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  const layers = (isPressed: boolean) => [
    s.base.root,
    s.variant[variant],
    s.size[size],
    isPressed && s.pressed[variant],
    disabled && s.base.disabled,
    style,
  ];

  if (!render) {
    return (
      <TextStyleContext.Provider value={s.text[variant]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !!disabled }}
          disabled={disabled}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={({ pressed: isPressed }) => layers(isPressed)}
          {...props}
        >
          {content}
        </Pressable>
      </TextStyleContext.Provider>
    );
  }

  // A rendered Link/Animated.View may not accept Pressable's function style, so pressed is tracked here.
  return (
    <TextStyleContext.Provider value={s.text[variant]}>
      {renderElement(
        Pressable,
        render,
        {
          accessibilityRole: 'button',
          accessibilityState: { disabled: !!disabled },
          disabled,
          style: layers(pressed),
          ...props,
          onPressIn: (e) => {
            setPressed(true);
            onPressIn?.(e);
          },
          onPressOut: (e) => {
            setPressed(false);
            onPressOut?.(e);
          },
          children: content,
        } as PressableProps,
        { pressed, disabled: !!disabled },
      )}
    </TextStyleContext.Provider>
  );
}
