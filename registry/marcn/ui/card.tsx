import type { Ref } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      gap: t.spacing[6],
      paddingVertical: t.spacing[6],
      borderRadius: t.radius.xl,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
    },
    header: { gap: 6, paddingHorizontal: t.spacing[6] },
    title: { fontSize: t.fontSize.base, fontWeight: t.fontWeight.semibold, color: t.colors.cardForeground },
    content: { paddingHorizontal: t.spacing[6] },
    footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.spacing[6] },
  });

export type CardProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function Card({ style, render, ...props }: CardProps) {
  const s = useStyles(createStyles);
  return renderElement(View, render, { style: [s.card, style], ...props } as ViewProps);
}

export function CardHeader({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.header, style]} {...props} />;
}

export function CardTitle({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text accessibilityRole="header" style={[s.title, style]} {...props} />;
}

export function CardDescription(props: TextProps) {
  return <Text variant="muted" {...props} />;
}

export function CardContent({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.content, style]} {...props} />;
}

export function CardFooter({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return <View style={[s.footer, style]} {...props} />;
}
