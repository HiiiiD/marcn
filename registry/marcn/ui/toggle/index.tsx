import { useState } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/toggle/styles';
import type { ToggleProps } from '@/registry/marcn/ui/toggle/types';

export * from '@/registry/marcn/ui/toggle/types';

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
