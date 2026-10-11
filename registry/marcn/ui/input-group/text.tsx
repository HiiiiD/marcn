import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/input-group/styles';

export function InputGroupText({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text style={[s.text.muted, style]} {...props} />;
}
