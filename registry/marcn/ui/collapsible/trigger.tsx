import type { Ref } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useCollapsible, type CollapsibleState } from '@/registry/marcn/ui/collapsible/context';

export type CollapsibleTriggerProps = PressableProps & {
  render?: RenderProp<PressableProps, CollapsibleState>;
  ref?: Ref<View>;
};

export function CollapsibleTrigger({ render, disabled, onPress, ...props }: CollapsibleTriggerProps) {
  const ctx = useCollapsible();
  const isDisabled = !!(disabled || ctx.disabled);
  return renderElement(
    Pressable,
    render,
    {
      accessibilityRole: 'button',
      accessibilityState: { expanded: ctx.open, disabled: isDisabled },
      disabled: isDisabled,
      ...props,
      onPress: (e) => {
        onPress?.(e);
        ctx.setOpen(!ctx.open);
      },
    } as PressableProps,
    { open: ctx.open, disabled: isDisabled },
  );
}
