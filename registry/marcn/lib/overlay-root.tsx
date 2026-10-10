import { createContext, useContext, useId, useMemo, useRef, type ReactNode, type Ref, type RefObject } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';
import { mergeRefs, renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';

export type OverlayContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<View | null>;
  titleId: string;
  descriptionId: string;
};

export const OverlayContext = createContext<OverlayContextValue | null>(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('Overlay parts must be used within a Dialog, Popover or Sheet');
  return ctx;
}

export type OverlayState = { open: boolean };

export type OverlayRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export function OverlayRoot({ open: openProp, defaultOpen = false, onOpenChange, children }: OverlayRootProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const triggerRef = useRef<View>(null);
  const id = useId();
  const value = useMemo(
    () => ({ open, setOpen, triggerRef, titleId: `${id}-title`, descriptionId: `${id}-description` }),
    [open, setOpen, id],
  );
  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export type OverlayTriggerProps = PressableProps & { render?: RenderProp<PressableProps, OverlayState>; ref?: Ref<View> };

export function OverlayTrigger({ render, onPress, ref, ...props }: OverlayTriggerProps) {
  const ctx = useOverlay();
  return renderElement(
    Pressable,
    render,
    {
      accessibilityRole: 'button',
      accessibilityState: { expanded: ctx.open },
      ...props,
      ref: mergeRefs(ref, ctx.triggerRef),
      onPress: (e) => {
        onPress?.(e);
        ctx.setOpen(true);
      },
    } as PressableProps,
    { open: ctx.open },
  );
}

export type OverlayCloseProps = PressableProps & { render?: RenderProp<PressableProps, OverlayState>; ref?: Ref<View> };

export function OverlayClose({ render, onPress, ...props }: OverlayCloseProps) {
  const ctx = useOverlay();
  return renderElement(
    Pressable,
    render,
    {
      accessibilityRole: 'button',
      ...props,
      onPress: (e) => {
        onPress?.(e);
        ctx.setOpen(false);
      },
    } as PressableProps,
    { open: ctx.open },
  );
}
