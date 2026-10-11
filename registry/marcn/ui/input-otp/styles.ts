import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    input: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, color: 'transparent', backgroundColor: 'transparent', opacity: 0.011 },
    group: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    slot: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.input,
      borderRadius: t.radius.md,
    },
    active: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
    char: { fontSize: t.fontSize.base, color: t.colors.foreground },
    separator: { width: t.spacing[2], height: 2, borderRadius: 1, backgroundColor: t.colors.mutedForeground },
  });
