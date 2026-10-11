import type { ReactNode, Ref } from 'react';
import { Pressable, type AccessibilityActionEvent, type GestureResponderEvent, type PressableProps, type View } from 'react-native';
import { asText, useOverlay, type OverlayState } from '@/registry/marcn/ui/overlay/overlay-root';
import { mergeRefs, renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { usePoint } from '@/registry/marcn/ui/context-menu/context';

export type ContextMenuTriggerProps = PressableProps & {
  render?: RenderProp<PressableProps, OverlayState>;
  ref?: Ref<View>;
};

export function ContextMenuTrigger({ render, onLongPress, onAccessibilityAction, ref, children, ...props }: ContextMenuTriggerProps) {
  const ctx = useOverlay();
  const { setPoint } = usePoint();
  return renderElement(
    Pressable,
    render,
    {
      accessibilityRole: 'button',
      accessibilityState: { expanded: ctx.open },
      // A declared 'activate' action swallows the screen-reader double-tap and starves onPress.
      accessibilityActions: [{ name: 'longpress', label: 'Open menu' }],
      ...props,
      children: asText(children as ReactNode),
      ref: mergeRefs(ref, ctx.triggerRef),
      onLongPress: (e: GestureResponderEvent) => {
        onLongPress?.(e);
        setPoint({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
        ctx.setOpen(true);
      },
      onAccessibilityAction: (e: AccessibilityActionEvent) => {
        onAccessibilityAction?.(e);
        if (props.disabled || e.nativeEvent.actionName !== 'longpress') return;
        setPoint(null);
        ctx.setOpen(true);
      },
    } as PressableProps,
    { open: ctx.open },
  );
}
