import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type View, type ViewStyle } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';

export type ToggleVariant = 'default' | 'outline';
export type ToggleSize = 'default' | 'sm' | 'lg';
export type ToggleState = { on: boolean; pressed: boolean; disabled: boolean };
export type ToggleProps = Omit<PressableProps, 'style'> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: ToggleVariant;
  size?: ToggleSize;
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, ToggleState>;
  ref?: Ref<View>;
};

const createStyles = (t: Theme) => {
  const text = { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium };
  return {
    base: StyleSheet.create({
      root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], borderRadius: t.radius.md },
      on: { backgroundColor: t.colors.accent },
      touch: { backgroundColor: t.colors.muted },
      disabled: { opacity: 0.5 },
    }),
    variant: StyleSheet.create({
      default: { backgroundColor: 'transparent' },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.colors.input },
    }),
    size: StyleSheet.create({
      default: { height: 36, minWidth: 36, paddingHorizontal: t.spacing[2] },
      sm: { height: 32, minWidth: 32, paddingHorizontal: 6 },
      lg: { height: 40, minWidth: 40, paddingHorizontal: 10 },
    }),
    text: StyleSheet.create({
      off: { ...text, color: t.colors.foreground },
      on: { ...text, color: t.colors.accentForeground },
    }),
  };
};

export function Toggle({
  pressed: pressedProp,
  defaultPressed = false,
  onPressedChange,
  variant = 'default',
  size = 'default',
  style,
  disabled,
  render,
  children,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ToggleProps) {
  const s = useStyles(createStyles);
  const [on, setOn] = useControllableState({ value: pressedProp, defaultValue: defaultPressed, onChange: onPressedChange });
  const [touch, setTouch] = useState(false);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  const layers = (isTouch: boolean) => [
    s.base.root,
    s.variant[variant],
    s.size[size],
    isTouch && !on && s.base.touch,
    on && s.base.on,
    disabled && s.base.disabled,
    style,
  ];
  const handlePress: PressableProps['onPress'] = (e) => {
    onPress?.(e);
    setOn(!on);
  };

  if (!render) {
    return (
      <TextStyleContext.Provider value={on ? s.text.on : s.text.off}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: on, disabled: !!disabled }}
          disabled={disabled}
          style={({ pressed: isTouch }) => layers(isTouch)}
          {...props}
          onPress={handlePress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          {content}
        </Pressable>
      </TextStyleContext.Provider>
    );
  }

  // A rendered element may not accept Pressable's function style, so touch state is tracked here.
  return (
    <TextStyleContext.Provider value={on ? s.text.on : s.text.off}>
      {renderElement(
        Pressable,
        render,
        {
          accessibilityRole: 'button',
          accessibilityState: { selected: on, disabled: !!disabled },
          disabled,
          style: layers(touch),
          ...props,
          onPress: handlePress,
          onPressIn: (e) => {
            setTouch(true);
            onPressIn?.(e);
          },
          onPressOut: (e) => {
            setTouch(false);
            onPressOut?.(e);
          },
          children: content,
        } as PressableProps,
        { on, pressed: touch, disabled: !!disabled },
        ['onPressIn', 'onPressOut'],
      )}
    </TextStyleContext.Provider>
  );
}
