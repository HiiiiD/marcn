import { createContext, useContext, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { asText, useOverlay } from '@/registry/marcn/lib/overlay-root';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Separator, type SeparatorProps } from '@/registry/marcn/ui/separator';
import { Text, TextStyleContext, type TextProps } from '@/registry/marcn/ui/text';

export type MenuItemVariant = 'default' | 'destructive';

const createStyles = (t: Theme) => ({
  base: StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing[2],
      minHeight: 36,
      paddingHorizontal: t.spacing[2],
      paddingVertical: t.spacing[1],
      borderRadius: t.radius.sm,
    },
    padStart: { paddingLeft: t.spacing[8] },
    padEnd: { paddingRight: t.spacing[8] },
    pressed: { backgroundColor: t.colors.accent },
    disabled: { opacity: 0.5 },
    indicatorStart: { position: 'absolute', left: t.spacing[2], width: 16, alignItems: 'center' },
    indicatorEnd: { position: 'absolute', right: t.spacing[2], width: 16, alignItems: 'center' },
    label: { paddingHorizontal: t.spacing[2], paddingVertical: t.spacing[1], fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
    shortcut: { marginLeft: 'auto', fontSize: t.fontSize.xs, color: t.colors.mutedForeground },
    separator: { marginVertical: t.spacing[1], marginHorizontal: -t.spacing[1] },
  }),
  text: StyleSheet.create({
    default: { fontSize: t.fontSize.sm, color: t.colors.popoverForeground },
    destructive: { fontSize: t.fontSize.sm, color: t.colors.destructive },
  }),
});

export type MenuItemRowProps = Omit<PressableProps, 'style'> & {
  variant?: MenuItemVariant;
  inset?: boolean;
  indicator?: ReactNode;
  indicatorSide?: 'start' | 'end';
  style?: StyleProp<ViewStyle>;
  ref?: Ref<View>;
};

export function MenuItemRow({
  variant = 'default', inset, indicator, indicatorSide = 'start', disabled, accessibilityState, style, children, ...props
}: MenuItemRowProps) {
  const s = useStyles(createStyles);
  // `null` still reserves the slot, so toggling a checkbox/radio/option does not shift the row's text.
  const hasIndicator = indicator !== undefined;
  return (
    <TextStyleContext.Provider value={s.text[variant]}>
      <Pressable
        disabled={disabled}
        accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
        style={({ pressed }) => [
          s.base.row,
          (inset || (hasIndicator && indicatorSide === 'start')) && s.base.padStart,
          hasIndicator && indicatorSide === 'end' && s.base.padEnd,
          pressed && s.base.pressed,
          disabled && s.base.disabled,
          style,
        ]}
        {...props}
      >
        {asText(children as ReactNode)}
        {!!indicator && <View style={indicatorSide === 'end' ? s.base.indicatorEnd : s.base.indicatorStart}>{indicator}</View>}
      </Pressable>
    </TextStyleContext.Provider>
  );
}

export function MenuLabel({ inset, style, ...props }: TextProps & { inset?: boolean }) {
  const s = useStyles(createStyles);
  return <Text style={[s.base.label, inset && s.base.padStart, style]} {...props} />;
}

export function MenuShortcut({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text style={[s.base.shortcut, style]} {...props} />;
}

export function MenuSeparator({ style, ...props }: SeparatorProps) {
  const s = useStyles(createStyles);
  return <Separator style={[s.base.separator, style]} {...props} />;
}

export const MenuCloseContext = createContext<(() => void) | null>(null);

export function useMenuClose() {
  const inherited = useContext(MenuCloseContext);
  const { setOpen } = useOverlay();
  return inherited ?? (() => setOpen(false));
}
