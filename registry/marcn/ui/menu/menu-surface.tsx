import { createContext, useCallback, useContext, useRef, type Ref } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useOverlay } from '@/registry/marcn/ui/overlay/overlay-root';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { splitAnchored, useAnchoredPosition, type AnchoredOptions, type AnchorPoint } from '@/registry/marcn/lib/use-anchored-position';

const BORDER = 1;

const createStyles = (t: Theme) => ({
  ...StyleSheet.create({
    surface: {
      position: 'absolute',
      minWidth: 128,
      padding: t.spacing[1],
      borderRadius: t.radius.md,
      borderWidth: BORDER,
      borderColor: t.colors.border,
      backgroundColor: t.colors.popover,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
  }),
  chrome: (t.spacing[1] + BORDER) * 2,
});

const ScrollContext = createContext<((node: View) => void) | null>(null);

// Lets a row bring itself into view in a long list; a no-op outside a MenuSurface.
export function useScrollIntoView() {
  return useContext(ScrollContext);
}

export type MenuSurfaceProps = ViewProps &
  AnchoredOptions & {
    matchTriggerWidth?: boolean;
    anchorPoint?: AnchorPoint | null;
    render?: RenderProp<ViewProps>;
    ref?: Ref<View>;
  };

export function MenuSurface({ matchTriggerWidth, anchorPoint, style, render, onLayout, children, ref, ...rest }: MenuSurfaceProps) {
  const [anchored, props] = splitAnchored(rest, { side: 'bottom', align: 'start' });
  const s = useStyles(createStyles);
  const { open, triggerRef } = useOverlay();
  const pos = useAnchoredPosition(open, triggerRef, { ...anchored, point: anchorPoint });
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);

  const scrollIntoView = useCallback((node: View) => {
    const content = contentRef.current;
    if (!content) return;
    node.measureLayout(content, (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: false }), () => {});
  }, []);

  return renderElement(Animated.View, render, {
    ...props,
    ref,
    onLayout: (e: LayoutChangeEvent) => {
      pos.onLayout(e);
      onLayout?.(e);
    },
    style: [s.surface, pos.style, matchTriggerWidth && pos.anchor && { minWidth: Math.max(128, pos.anchor.width) }, style],
    children: (
      <ScrollView
        ref={scrollRef}
        style={{ maxHeight: Math.max(0, pos.maxHeight - s.chrome) }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        bounces={false}
      >
        <View ref={contentRef} collapsable={false}>
          <ScrollContext.Provider value={scrollIntoView}>{children}</ScrollContext.Provider>
        </View>
      </ScrollView>
    ),
  } as ViewProps);
}
