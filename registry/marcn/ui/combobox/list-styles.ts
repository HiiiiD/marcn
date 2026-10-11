import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createListStyles = (t: Theme) =>
  StyleSheet.create({
    list: { flexGrow: 0, flexShrink: 1, maxHeight: 300 },
    listContent: { padding: t.spacing[1] },
    empty: { paddingVertical: t.spacing[6], textAlign: 'center', fontSize: t.fontSize.sm },
    label: { paddingHorizontal: t.spacing[2], paddingVertical: t.spacing[1], fontSize: t.fontSize.xs, color: t.colors.mutedForeground },
  });
