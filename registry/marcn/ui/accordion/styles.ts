import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) => ({
  layout: StyleSheet.create({
    root: { overflow: 'hidden' },
    // The last item's bottom border is pushed out of the clipped root, like `last:border-b-0`.
    inner: { marginBottom: -1 },
    item: { borderBottomWidth: 1, borderBottomColor: t.colors.border },
    trigger: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: t.spacing[4], paddingVertical: t.spacing[4] },
    content: { paddingBottom: t.spacing[4] },
    disabled: { opacity: 0.5 },
    rotated: { transform: [{ rotate: '180deg' }] },
  }),
  triggerText: { flex: 1, fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.foreground },
  contentText: { fontSize: t.fontSize.sm, color: t.colors.foreground },
});
