import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';
import { useCommand } from '@/registry/marcn/ui/command/context';
import { createStyles } from '@/registry/marcn/ui/command/styles';

export function CommandEmpty({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const { visibleCount } = useCommand();
  if (visibleCount > 0) return null;
  return <Text accessibilityLiveRegion="polite" style={[s.empty, style]} {...props} />;
}
