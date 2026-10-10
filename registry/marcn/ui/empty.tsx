import type { Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    empty: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.spacing[6],
      padding: t.spacing[6],
      borderRadius: t.radius.lg,
      borderStyle: 'dashed',
      borderColor: t.colors.border,
    },
    header: { maxWidth: 384, alignItems: 'center', gap: t.spacing[2] },
    media: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', marginBottom: t.spacing[2] },
    mediaDefault: { backgroundColor: 'transparent' },
    mediaIcon: { width: 40, height: 40, borderRadius: t.radius.lg, backgroundColor: t.colors.muted },
    title: { fontSize: t.fontSize.lg, fontWeight: t.fontWeight.medium, letterSpacing: -0.45, textAlign: 'center' },
    description: { fontSize: t.fontSize.sm, lineHeight: 23, textAlign: 'center' },
    content: { width: '100%', maxWidth: 384, minWidth: 0, alignItems: 'center', gap: t.spacing[4] },
  });

export type EmptyProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function Empty({ style, render, ...props }: EmptyProps) {
  const s = useStyles(createStyles);
  return renderElement(View, render, { style: [s.empty, style], ...props } as ViewProps);
}

export function EmptyHeader({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.header, style]} {...props} />;
}

export function EmptyMedia({ variant = 'default', style, ...props }: ViewProps & { variant?: 'default' | 'icon' }) {
  const s = useStyles(createStyles);
  return <View style={[s.media, variant === 'icon' ? s.mediaIcon : s.mediaDefault, style]} {...props} />;
}

export function EmptyTitle({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text accessibilityRole="header" style={[s.title, style]} {...props} />;
}

export function EmptyDescription({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text variant="muted" style={[s.description, style]} {...props} />;
}

export function EmptyContent({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.content, style]} {...props} />;
}
