import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: {
      width: '100%',
      overflow: 'hidden',
      padding: t.spacing[1],
      borderRadius: t.radius.xl,
      backgroundColor: t.colors.popover,
    },
    inputWrap: { padding: t.spacing[1], paddingBottom: 0 },
    inputGroup: { borderRadius: t.radius.lg },
    list: { flexGrow: 0, flexShrink: 1, maxHeight: 300 },
    listContent: { paddingTop: t.spacing[1] },
    empty: { paddingVertical: t.spacing[6], textAlign: 'center', fontSize: t.fontSize.sm },
    group: { paddingVertical: t.spacing[1] },
    heading: { paddingHorizontal: t.spacing[2], paddingVertical: t.spacing[1], fontSize: t.fontSize.xs, fontWeight: t.fontWeight.medium, color: t.colors.mutedForeground },
    hidden: { display: 'none' },
    best: { backgroundColor: t.colors.accent },
    srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
    dialog: { padding: 0, overflow: 'hidden' },
  });
