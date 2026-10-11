import { useStyles } from '@/registry/marcn/lib/theme';
import { Button } from '@/registry/marcn/ui/button';
import { createStyles } from '@/registry/marcn/ui/input-group/styles';
import type { InputGroupButtonProps } from '@/registry/marcn/ui/input-group/types';

export function InputGroupButton({ variant = 'ghost', size = 'xs', style, ...props }: InputGroupButtonProps) {
  const s = useStyles(createStyles);
  return <Button variant={variant} size="sm" style={[s.button[size], style]} {...props} />;
}
