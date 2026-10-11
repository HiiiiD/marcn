import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) => {
  const text = { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium };
  return {
    layout: StyleSheet.create({
      root: { gap: t.spacing[2] },
      rootVertical: { flexDirection: 'row' },
      list: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', padding: 3, borderRadius: t.radius.lg, backgroundColor: t.colors.muted },
      listVertical: { flexDirection: 'column', alignItems: 'stretch' },
      trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: t.spacing[2],
        paddingVertical: t.spacing[1] + 1,
        borderRadius: t.radius.md,
      },
      selected: { backgroundColor: t.colors.background },
      disabled: { opacity: 0.5 },
    }),
    text: StyleSheet.create({
      selected: { ...text, color: t.colors.foreground },
      idle: { ...text, color: t.colors.mutedForeground },
    }),
  };
};
