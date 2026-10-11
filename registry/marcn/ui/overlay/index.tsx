import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useBackDismiss } from '@/registry/marcn/lib/back-stack';
import { OverlayContext, useOverlay } from '@/registry/marcn/ui/overlay/overlay-root';
import { Portal } from '@/registry/marcn/ui/portal';
import { usePresence, useProgress } from '@/registry/marcn/lib/use-presence';

// Same black/50 scrim in both schemes, like shadcn.
const SCRIM = 'rgba(0,0,0,0.5)';

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  scrim: { backgroundColor: SCRIM },
  content: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'box-none' },
});

function focusNode(ref: RefObject<View | null>) {
  if (ref.current) AccessibilityInfo.sendAccessibilityEvent?.(ref.current, 'focus');
}

export type OverlayProps = {
  children: ReactNode;
  modal?: boolean;
  scrim?: boolean;
  dismissable?: boolean;
  dismissOnBackdrop?: boolean;
  onBackdropPress?: () => void;
  initialFocusRef?: RefObject<View | null>;
};

export function Overlay({
  children, modal = true, scrim = modal, dismissable = true, dismissOnBackdrop = true, onBackdropPress, initialFocusRef,
}: OverlayProps) {
  const ctx = useOverlay();
  const present = usePresence(ctx.open);
  const wasPresent = useRef(present);

  // Deferred so the host has un-hidden the app before focus returns to the trigger.
  useEffect(() => {
    if (present) {
      wasPresent.current = true;
      return;
    }
    if (!wasPresent.current) return;
    wasPresent.current = false;
    const timer = setTimeout(() => focusNode(ctx.triggerRef), 0);
    return () => clearTimeout(timer);
  }, [present, ctx.triggerRef]);

  if (!present) return null;
  return (
    <Portal modal={modal}>
      <OverlayContext.Provider value={ctx}>
        <OverlayLayer
          open={ctx.open}
          scrim={scrim}
          dismissable={dismissable}
          dismissOnBackdrop={dismissOnBackdrop}
          onBackdropPress={onBackdropPress}
          onClose={() => ctx.setOpen(false)}
          initialFocusRef={initialFocusRef}
        >
          {children}
        </OverlayLayer>
      </OverlayContext.Provider>
    </Portal>
  );
}

type LayerProps = {
  open: boolean;
  scrim: boolean;
  dismissable: boolean;
  dismissOnBackdrop: boolean;
  onBackdropPress?: () => void;
  onClose: () => void;
  initialFocusRef?: RefObject<View | null>;
  children: ReactNode;
};

function OverlayLayer({ open, scrim, dismissable, dismissOnBackdrop, onBackdropPress, onClose, initialFocusRef, children }: LayerProps) {
  const progress = useProgress(open);
  const rootRef = useRef<View>(null);
  const dismiss = useCallback(() => {
    if (dismissable) onClose();
  }, [dismissable, onClose]);

  useBackDismiss(open, dismiss);

  useEffect(() => {
    // A ref with nothing attached (an AlertDialog without a Cancel) must not swallow the focus.
    if (open) focusNode(initialFocusRef?.current ? initialFocusRef : rootRef);
  }, [open, initialFocusRef]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View style={styles.fill}>
      <Animated.View style={[styles.fill, scrim && styles.scrim, scrimStyle, { pointerEvents: open ? 'auto' : 'none' }]}>
        <Pressable testID="overlay-backdrop" style={styles.fill} accessible={false} onPress={dismissOnBackdrop ? (dismissable && onBackdropPress) || dismiss : undefined} />
      </Animated.View>
      <View
        ref={rootRef}
        testID="overlay-content"
        style={[styles.content, { pointerEvents: open ? 'box-none' : 'none' }]}
        onAccessibilityEscape={dismiss}
      >
        {children}
      </View>
    </View>
  );
}
