import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/table/styles';

export function TableCaption({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text variant="muted" style={[s.caption, style]} {...props} />;
}
