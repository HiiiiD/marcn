import { useEffect, useRef, type ReactNode, type Ref } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import { asText } from '@/registry/marcn/ui/overlay/overlay-root';
import { mergeRefs, renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useTooltip } from '@/registry/marcn/ui/tooltip/context';

export type TooltipTriggerProps = PressableProps & { render?: RenderProp<PressableProps, { open: boolean }>; ref?: Ref<View> };

export function TooltipTrigger({ render, onLongPress, onPressOut, ref, children, ...props }: TooltipTriggerProps) {
  const ctx = useTooltip();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(ctx);
  latest.current = ctx;
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      // Only the trigger going away closes it; tearing down the whole tooltip is not a user-visible close.
      if (latest.current.alive.current && latest.current.open) latest.current.setOpen(false);
    },
    [],
  );

  return renderElement(
    Pressable,
    render,
    {
      accessibilityHint: ctx.hint,
      delayLongPress: ctx.delayDuration,
      ...props,
      children: asText(children as ReactNode),
      ref: mergeRefs(ref, ctx.triggerRef),
      onLongPress: (e) => {
        onLongPress?.(e);
        clearTimeout(timer.current);
        ctx.setOpen(true);
      },
      onPressOut: (e) => {
        onPressOut?.(e);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => ctx.setOpen(false), ctx.duration);
      },
    } as PressableProps,
    { open: ctx.open },
    ['onPressOut'],
  );
}
