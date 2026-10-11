import { StyleSheet, type ViewStyle } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const MIN_COLUMN_WIDTH = 96;

export const span = (n: number): ViewStyle | undefined =>
  n > 1 ? { flexGrow: n, minWidth: MIN_COLUMN_WIDTH * n } : undefined;

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    scroll: { width: '100%' },
    scrollContent: { minWidth: '100%' },
    table: { flexGrow: 1 },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: t.colors.border },
    rowLast: { borderBottomWidth: 0 },
    rowSelected: { backgroundColor: t.colors.muted },
    footer: { borderTopWidth: 1, borderTopColor: t.colors.border, backgroundColor: `${t.colors.muted}80` },
    column: { flexGrow: 1, flexBasis: 0, minWidth: MIN_COLUMN_WIDTH, justifyContent: 'center' },
    head: { height: 40, paddingHorizontal: t.spacing[2] },
    cell: { padding: t.spacing[2] },
    caption: { marginTop: t.spacing[4] },
    text: { fontSize: t.fontSize.sm },
    textMedium: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
  });
