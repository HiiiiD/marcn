import {
  createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type Ref, type RefObject,
} from 'react';
import { Pressable, StyleSheet, type LayoutChangeEvent, type PressableProps, type View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { asText } from '@/registry/marcn/lib/overlay-root';
import { Portal } from '@/registry/marcn/lib/portal';
import { mergeRefs, renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { usePresence } from '@/registry/marcn/lib/use-presence';
import { TextStyleContext } from '@/registry/marcn/ui/text';

const createStyles = (t: Theme) => ({
  bubble: StyleSheet.create({
    surface: {
      position: 'absolute',
      pointerEvents: 'none',
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[1] * 1.5,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.foreground,
    },
  }),
  text: StyleSheet.create({ base: { color: t.colors.background, fontSize: t.fontSize.xs } }),
});

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<View | null>;
  hint?: string;
  setHint: (hint?: string) => void;
  delayDuration: number;
  duration: number;
};

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('Tooltip parts must be used within a Tooltip');
  return ctx;
}

export type TooltipProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  duration?: number;
  children?: ReactNode;
};

export function Tooltip({ open: openProp, defaultOpen = false, onOpenChange, delayDuration = 300, duration = 2000, children }: TooltipProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [hint, setHint] = useState<string>();
  const triggerRef = useRef<View>(null);
  const value = useMemo(
    () => ({ open, setOpen, triggerRef, hint, setHint, delayDuration, duration }),
    [open, setOpen, hint, delayDuration, duration],
  );
  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

export type TooltipTriggerProps = PressableProps & { render?: RenderProp<PressableProps, { open: boolean }>; ref?: Ref<View> };

export function TooltipTrigger({ render, onLongPress, onPressOut, ref, children, ...props }: TooltipTriggerProps) {
  const ctx = useTooltip();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

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

export type TooltipContentProps = ViewProps & AnchoredOptions & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function TooltipContent({ children, ...props }: TooltipContentProps) {
  const ctx = useTooltip();
  const present = usePresence(ctx.open);
  const { setHint } = ctx;

  useEffect(() => {
    setHint(typeof children === 'string' ? children : undefined);
  }, [children, setHint]);

  if (!present) return null;
  return (
    <Portal modal={false}>
      <TooltipContext.Provider value={ctx}>
        <TooltipSurface {...props}>{children}</TooltipSurface>
      </TooltipContext.Provider>
    </Portal>
  );
}

function TooltipSurface({
  side = 'top',
  align,
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  style,
  render,
  onLayout,
  children,
  ...props
}: TooltipContentProps) {
  const s = useStyles(createStyles);
  const { open, triggerRef } = useTooltip();
  const pos = useAnchoredPosition(open, triggerRef, { side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding });

  return (
    <TextStyleContext.Provider value={s.text.base}>
      {renderElement(Animated.View, render, {
        role: 'tooltip',
        accessibilityLiveRegion: 'polite',
        ...props,
        children: asText(children),
        onLayout: (e: LayoutChangeEvent) => {
          pos.onLayout(e);
          onLayout?.(e);
        },
        style: [s.bubble.surface, pos.style, style],
      } as ViewProps)}
    </TextStyleContext.Provider>
  );
}
