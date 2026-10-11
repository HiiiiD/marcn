import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Separator, type SeparatorProps } from '@/registry/marcn/ui/separator';
import { Text, type TextProps } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/item/styles';
import type { ItemMediaVariant } from '@/registry/marcn/ui/item/types';

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
