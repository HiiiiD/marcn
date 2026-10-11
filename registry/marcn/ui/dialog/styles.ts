import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: t.spacing[4], pointerEvents: 'box-none' },
    surface: {
      width: '100%',
      maxWidth: 425,
      maxHeight: '100%',
      padding: t.spacing[6],
      borderRadius: t.radius.lg,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.background,
    },
    scroll: { flexGrow: 0 },
    body: { gap: t.spacing[4] },
    close: { position: 'absolute', top: t.spacing[4], right: t.spacing[4], opacity: 0.7 },
    header: { gap: t.spacing[2] },
    footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: t.spacing[2] },
    title: { fontSize: t.fontSize.lg, fontWeight: t.fontWeight.semibold },
  });
