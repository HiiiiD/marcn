import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    group: {},
    item: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    default: { backgroundColor: 'transparent' },
    outline: { borderColor: t.colors.border },
    // muted is a hex color in both themes, so an 80 suffix is 50% alpha.
    muted: { backgroundColor: `${t.colors.muted}80` },
    sizeDefault: { gap: t.spacing[4], padding: t.spacing[4] },
    sizeSm: { gap: 10, paddingHorizontal: t.spacing[4], paddingVertical: t.spacing[3] },
    media: { flexShrink: 0, alignItems: 'center', justifyContent: 'center', gap: t.spacing[2] },
    mediaDefault: { backgroundColor: 'transparent' },
    mediaIcon: {
      width: 32,
      height: 32,
      borderRadius: t.radius.sm,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.muted,
    },
    mediaImage: { width: 40, height: 40, borderRadius: t.radius.sm, overflow: 'hidden' },
    content: { flex: 1, gap: t.spacing[1] },
    title: { alignSelf: 'flex-start', fontSize: t.fontSize.sm, lineHeight: 19, fontWeight: t.fontWeight.medium },
    description: { fontSize: t.fontSize.sm, lineHeight: 21, fontWeight: t.fontWeight.normal, color: t.colors.mutedForeground },
    actions: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    row: { flexBasis: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing[2] },
  });
