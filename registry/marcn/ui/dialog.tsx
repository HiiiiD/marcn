import type { Ref } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import {
  OverlayClose, OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps,
} from '@/registry/marcn/lib/overlay-root';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';
import { useProgress } from '@/registry/marcn/lib/use-presence';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing[4], pointerEvents: 'box-none' },
    surface: {
      width: '100%',
      maxWidth: 425,
      maxHeight: '100%',
      padding: t.spacing[6],
      borderRadius: t.radius.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.background,
    },
    scroll: { flexGrow: 0 },
    body: { gap: t.spacing[4] },
    close: { position: 'absolute', top: t.spacing[4], right: t.spacing[4], opacity: 0.7 },
    header: { gap: t.spacing[2] },
    footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing[2] },
    title: { fontSize: t.fontSize.lg, fontWeight: t.fontWeight.semibold },
  });

export const Dialog = OverlayRoot;
export type DialogProps = OverlayRootProps;
export const DialogTrigger = OverlayTrigger;
export const DialogClose = OverlayClose;

export function DialogHeader({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.header, style]} {...props} />;
}

export function DialogFooter({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.footer, style]} {...props} />;
}

export function DialogTitle({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const { titleId } = useOverlay();
  return <Text nativeID={titleId} accessibilityRole="header" style={[s.title, style]} {...props} />;
}

export function DialogDescription(props: TextProps) {
  const { descriptionId } = useOverlay();
  return <Text variant="muted" nativeID={descriptionId} {...props} />;
}

type SurfaceProps = ViewProps & {
  showCloseButton?: boolean;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export type DialogContentProps = SurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function DialogContent({ dismissable, initialFocusRef, ...props }: DialogContentProps) {
  return (
    <Overlay dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <DialogSurface {...props} />
    </Overlay>
  );
}

function DialogSurface({ showCloseButton = true, style, render, children, ...props }: SurfaceProps) {
  const s = useStyles(createStyles);
  const { open, titleId } = useOverlay();
  const progress = useProgress(open);
  const { inset } = useKeyboardInset();
  const lift = useAnimatedStyle(() => ({ paddingBottom: inset.value }));
  const enter = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scale: 0.95 + 0.05 * progress.value }] }));

  return (
    <Animated.View style={[s.center, lift]}>
      {renderElement(Animated.View, render, {
        accessibilityLabelledBy: titleId,
        ...props,
        style: [s.surface, enter, style],
        children: (
          <>
            <ScrollView style={s.scroll} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
            {showCloseButton && (
              <DialogClose accessibilityLabel="Close" hitSlop={8} style={s.close}>
                <Icon icon={X} />
              </DialogClose>
            )}
          </>
        ),
      } as ViewProps)}
    </Animated.View>
  );
}
