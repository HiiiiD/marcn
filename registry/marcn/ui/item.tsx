import type { Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Separator, type SeparatorProps } from '@/registry/marcn/ui/separator';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

export type ItemVariant = 'default' | 'outline' | 'muted';
export type ItemSize = 'default' | 'sm';
export type ItemMediaVariant = 'default' | 'icon' | 'image';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    group: {},
    item: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    default: { backgroundColor: 'transparent' },
    outline: { borderColor: t.colors.border },
    // muted is a hex color in both themes, so an 80 suffix is 50% alpha.
    muted: { backgroundColor: `${t.colors.muted}80` },
    sizeDefault: { gap: t.spacing[4], padding: t.spacing[4] },
    sizeSm: { gap: 10, paddingHorizontal: t.spacing[4], paddingVertical: t.spacing[3] },
    media: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: t.spacing[2] },
    mediaDefault: { backgroundColor: 'transparent' },
    mediaIcon: {
      width: 32,
      height: 32,
      borderRadius: t.radius.sm,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.muted,
    },
    mediaImage: { width: 40, height: 40, borderRadius: t.radius.sm, overflow: 'hidden' },
    content: { flex: 1, gap: t.spacing[1] },
    title: { alignSelf: 'flex-start', fontSize: t.fontSize.sm, lineHeight: 19, fontWeight: t.fontWeight.medium },
    description: { fontSize: t.fontSize.sm, lineHeight: 21, fontWeight: t.fontWeight.normal, color: t.colors.mutedForeground },
    actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    row: { flexBasis: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing[2] },
  });

export type ItemProps = ViewProps & {
  variant?: ItemVariant;
  size?: ItemSize;
  render?: RenderProp<ViewProps>;
  ref?: Ref<View>;
};

export function Item({ variant = 'default', size = 'default', style, render, ...props }: ItemProps) {
  const s = useStyles(createStyles);
  const sizeStyle = size === 'sm' ? s.sizeSm : s.sizeDefault;
  return renderElement(View, render, { style: [s.item, s[variant], sizeStyle, style], ...props } as ViewProps);
}

export function ItemGroup(props: ViewProps) {
  return <View accessibilityRole="list" {...props} />;
}

export function ItemSeparator({ style, ...props }: SeparatorProps) {
  return <Separator style={[{ marginVertical: 0 }, style]} {...props} />;
}

export function ItemMedia({ variant = 'default', style, ...props }: ViewProps & { variant?: ItemMediaVariant }) {
  const s = useStyles(createStyles);
  const variantStyle = { default: s.mediaDefault, icon: s.mediaIcon, image: s.mediaImage }[variant];
  return <View style={[s.media, variantStyle, style]} {...props} />;
}

export function ItemContent({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.content, style]} {...props} />;
}

export function ItemTitle({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text style={[s.title, style]} {...props} />;
}

export function ItemDescription({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text numberOfLines={2} style={[s.description, style]} {...props} />;
}

export function ItemActions({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.actions, style]} {...props} />;
}

export function ItemHeader({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.row, style]} {...props} />;
}

export function ItemFooter({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.row, style]} {...props} />;
}
