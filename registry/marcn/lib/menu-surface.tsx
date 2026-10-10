import type { Ref } from 'react';
import { ScrollView, StyleSheet, type LayoutChangeEvent, type View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useOverlay } from '@/registry/marcn/lib/overlay-root';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    surface: {
      position: 'absolute',
      minWidth: 128,
      padding: t.spacing[1],
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

export type MenuSurfaceProps = ViewProps &
  AnchoredOptions & {
    matchTriggerWidth?: boolean;
    render?: RenderProp<ViewProps>;
    ref?: Ref<View>;
  };

export function MenuSurface({
  side = 'bottom',
  align = 'start',
  sideOffset,
  alignOffset,
  avoidCollisions,
  collisionPadding,
  matchTriggerWidth,
  style,
  render,
  onLayout,
  children,
  ...props
}: MenuSurfaceProps) {
  const s = useStyles(createStyles);
  const { open, triggerRef } = useOverlay();
  const pos = useAnchoredPosition(open, triggerRef, { side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding });

  return renderElement(Animated.View, render, {
    ...props,
    onLayout: (e: LayoutChangeEvent) => {
      pos.onLayout(e);
      onLayout?.(e);
    },
    style: [s.surface, pos.style, matchTriggerWidth && pos.anchor && { minWidth: pos.anchor.width }, style],
    children: (
      <ScrollView style={{ maxHeight: pos.maxHeight }} keyboardShouldPersistTaps="handled" bounces={false}>
        {children}
      </ScrollView>
    ),
  } as ViewProps);
}
