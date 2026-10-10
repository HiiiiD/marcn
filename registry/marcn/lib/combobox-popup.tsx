import { useCallback, useEffect, type Ref } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useBackDismiss } from '@/registry/marcn/lib/back-stack';
import { ComboboxContext, useCombobox } from '@/registry/marcn/lib/combobox-state';
import { Portal } from '@/registry/marcn/lib/portal';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { splitAnchored, useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import { usePresence } from '@/registry/marcn/lib/use-presence';

const PAD = 8;

const createStyles = (t: Theme) =>
  StyleSheet.create({
    layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'box-none' },
    hit: { position: 'absolute' },
    surface: {
      position: 'absolute',
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

export type ComboboxContentProps = ViewProps & Omit<AnchoredOptions, 'side'> & { dismissable?: boolean; ref?: Ref<View> };

export function ComboboxContent({ dismissable = true, ...props }: ComboboxContentProps) {
  const combobox = useCombobox();
  const present = usePresence(combobox.open);
  if (!present) return null;
  // Non-modal: the input it belongs to stays in the app tree, tappable and visible to screen readers.
  return (
    <Portal modal={false}>
      <ComboboxContext.Provider value={combobox}>
        <ComboboxPopup dismissable={dismissable} {...props} />
      </ComboboxContext.Provider>
    </Portal>
  );
}

function ComboboxPopup({ dismissable, style, onLayout, ...rest }: Omit<ComboboxContentProps, 'ref'> & { dismissable: boolean }) {
  const [anchored, props] = splitAnchored(rest, { align: 'start' });
  const s = useStyles(createStyles);
  const { open, setOpen, anchorRef, anchorTick } = useCombobox();
  const dismiss = useCallback(() => {
    if (dismissable) setOpen(false);
  }, [dismissable, setOpen]);
  useBackDismiss(open, dismiss);

  const pos = useAnchoredPosition(open, anchorRef, { ...anchored, fit: true });
  const a = pos.anchor;
  const { measure } = pos;
  useEffect(measure, [measure, anchorTick]);

  const edge = { pointerEvents: open ? 'auto' : 'none' } as const;
  const hole = a && {
    top: { top: 0, left: 0, right: 0, height: a.y },
    bottom: { top: a.y + a.height, left: 0, right: 0, bottom: 0 },
    left: { top: a.y, left: 0, width: a.x, height: a.height },
    right: { top: a.y, left: a.x + a.width, right: 0, height: a.height },
  };

  return (
    <View style={s.layer}>
      {hole && (Object.keys(hole) as (keyof typeof hole)[]).map((key) => (
        <Pressable key={key} testID={`combobox-backdrop-${key}`} accessible={false} onPress={dismiss} style={[s.hit, hole[key], edge]} />
      ))}
      <Animated.View
        {...props}
        onAccessibilityEscape={dismiss}
        onLayout={(e: LayoutChangeEvent) => {
          pos.onLayout(e);
          onLayout?.(e);
        }}
        style={[s.surface, pos.style, edge, { width: a?.width ?? 0, maxHeight: pos.maxHeight }, style]}
      />
    </View>
  );
}
