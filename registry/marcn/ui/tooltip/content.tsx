import { useEffect, type Ref } from 'react';
import { StyleSheet, type LayoutChangeEvent, type View, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { asText } from '@/registry/marcn/ui/overlay/overlay-root';
import { Portal } from '@/registry/marcn/ui/portal';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { splitAnchored, useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import { usePresence } from '@/registry/marcn/lib/use-presence';
import { TextStyleContext } from '@/registry/marcn/ui/text';
import { TooltipContext, useTooltip } from '@/registry/marcn/ui/tooltip/context';

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

export type TooltipContentProps = ViewProps & AnchoredOptions & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function TooltipContent({ children, ...props }: TooltipContentProps) {
  const ctx = useTooltip();
  const present = usePresence(ctx.open);
  const { setHint } = ctx;

  useEffect(() => {
    setHint(typeof children === 'string' ? children : undefined);
    return () => setHint(undefined);
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

function TooltipSurface({ style, render, onLayout, children, ...rest }: TooltipContentProps) {
  const [anchored, props] = splitAnchored(rest, { side: 'top' });
  const s = useStyles(createStyles);
  const { open, triggerRef } = useTooltip();
  const pos = useAnchoredPosition(open, triggerRef, anchored);

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
