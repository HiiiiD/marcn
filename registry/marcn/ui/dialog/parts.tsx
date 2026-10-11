import { View, type ViewProps } from 'react-native';
import { useOverlay } from '@/registry/marcn/ui/overlay/overlay-root';
import { useStyles } from '@/registry/marcn/lib/theme';
import { createStyles } from '@/registry/marcn/ui/dialog/styles';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

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
