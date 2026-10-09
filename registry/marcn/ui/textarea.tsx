import { StyleSheet } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Input, type InputProps } from '@/registry/marcn/ui/input';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    area: { height: undefined, minHeight: 64, paddingVertical: t.spacing[2], textAlignVertical: 'top' },
  });

export function Textarea({ style, ...props }: InputProps) {
  const s = useStyles(createStyles);
  return <Input multiline style={[s.area, style]} {...props} />;
}
