import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing[2],
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.input,
    },
    invalid: { borderColor: t.colors.destructive },
    default: { height: 36 },
    sm: { height: 32 },
    disabled: { opacity: 0.5 },
    value: { flexShrink: 1, fontSize: t.fontSize.sm },
    placeholder: { color: t.colors.mutedForeground },
  });
