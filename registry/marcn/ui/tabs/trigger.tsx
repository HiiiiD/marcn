import type { Ref } from 'react';
import { Pressable, type PressableProps, type StyleProp, type View, type ViewStyle } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { useTabs } from '@/registry/marcn/ui/tabs/context';
import { createStyles } from '@/registry/marcn/ui/tabs/styles';

export type TabsTriggerState = { selected: boolean; disabled: boolean };
export type TabsTriggerProps = Omit<PressableProps, 'style'> & {
  value: string;
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, TabsTriggerState>;
  ref?: Ref<View>;
};

export function TabsTrigger({ value, style, disabled, render, children, onPress, ...props }: TabsTriggerProps) {
  const s = useStyles(createStyles);
  const ctx = useTabs();
  const selected = ctx.value === value;
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={selected ? s.text.selected : s.text.idle}>
      {renderElement(
        Pressable,
        render,
        {
          accessibilityRole: 'tab',
          accessibilityState: { selected, disabled: !!disabled },
          disabled,
          style: [s.layout.trigger, selected && s.layout.selected, disabled && s.layout.disabled, style],
          ...props,
          onPress: (e) => {
            onPress?.(e);
            ctx.setValue(value);
          },
          children: content,
        } as PressableProps,
        { selected, disabled: !!disabled },
      )}
    </TextStyleContext.Provider>
  );
}
