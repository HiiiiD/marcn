import type { Ref } from 'react';
import { StyleSheet, type LayoutChangeEvent, type View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { asText, OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps } from '@/registry/marcn/lib/overlay-root';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { splitAnchored, useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    surface: {
      position: 'absolute',
      width: 288,
      padding: t.spacing[4],
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.popover,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
  });

export const Popover = OverlayRoot;
export type PopoverProps = OverlayRootProps;
export const PopoverTrigger = OverlayTrigger;

type SurfaceProps = ViewProps &
  AnchoredOptions & {
    render?: RenderProp<ViewProps>;
    ref?: Ref<View>;
  };

export type PopoverContentProps = SurfaceProps & {
  modal?: boolean;
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function PopoverContent({ modal = false, dismissable, initialFocusRef, ...props }: PopoverContentProps) {
  return (
    <Overlay modal={modal} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <PopoverSurface {...props} />
    </Overlay>
  );
}

function PopoverSurface({ style, render, onLayout, children, ...rest }: SurfaceProps) {
  const [anchored, props] = splitAnchored(rest);
  const s = useStyles(createStyles);
  const { open, triggerRef } = useOverlay();
  const pos = useAnchoredPosition(open, triggerRef, anchored);

  return renderElement(Animated.View, render, {
    ...props,
    children: asText(children),
    onLayout: (e: LayoutChangeEvent) => {
      pos.onLayout(e);
      onLayout?.(e);
    },
    style: [s.surface, pos.style, style],
  } as ViewProps);
}
