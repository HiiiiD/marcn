import { StyleSheet } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

export type LabelProps = TextProps & { disabled?: boolean };

const createStyles = (t: Theme) =>
  StyleSheet.create({
    label: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, lineHeight: 14 },
    disabled: { opacity: 0.5 },
  });

export function Label({ style, disabled, ...props }: LabelProps) {
  const s = useStyles(createStyles);
  return <Text style={[s.label, disabled && s.disabled, style]} {...props} />;
}
