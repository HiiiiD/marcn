import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/button/styles';
import type { ButtonProps } from '@/registry/marcn/ui/button/types';

export * from '@/registry/marcn/ui/button/types';

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
        ['onPressIn', 'onPressOut'],
      )}
    </TextStyleContext.Provider>
  );
}
