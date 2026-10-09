import { createContext, useContext } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

export type AlertVariant = 'default' | 'destructive';

const AlertContext = createContext<AlertVariant>('default');

const createStyles = (t: Theme) =>
  StyleSheet.create({
    alert: {
      gap: 2,
      borderRadius: t.radius.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.card,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[3],
    },
    title: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.cardForeground },
    description: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
    destructive: { color: t.colors.destructive },
  });

export function Alert({ variant = 'default', style, ...props }: ViewProps & { variant?: AlertVariant }) {
  const s = useStyles(createStyles);
  return (
    <AlertContext.Provider value={variant}>
      <View accessibilityRole="alert" style={[s.alert, style]} {...props} />
    </AlertContext.Provider>
  );
}

export function AlertTitle({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const variant = useContext(AlertContext);
  return <Text style={[s.title, variant === 'destructive' && s.destructive, style]} {...props} />;
}

export function AlertDescription({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const variant = useContext(AlertContext);
  return <Text style={[s.description, variant === 'destructive' && s.destructive, style]} {...props} />;
}
