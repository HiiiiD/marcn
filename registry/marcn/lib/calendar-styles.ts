import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const CELL = 36;

export const createCalendarStyles = (t: Theme) => ({
  base: StyleSheet.create({
    root: { gap: t.spacing[3], alignSelf: 'stretch' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    captionButton: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[1], paddingHorizontal: t.spacing[2], height: CELL, borderRadius: t.radius.md },
    caption: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, textAlign: 'center' },
    body: { gap: t.spacing[3] },
    month: { gap: t.spacing[1] },
    row: { flexDirection: 'row' },
    weekday: { flex: 1, textAlign: 'center', fontSize: t.fontSize.xs, color: t.colors.mutedForeground },
    cell: { flex: 1, height: CELL, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.md },
    pick: { flexBasis: '33.333%', height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.md },
    picker: { flexDirection: 'row', flexWrap: 'wrap' },
    today: { backgroundColor: t.colors.accent },
    inRange: { backgroundColor: t.colors.accent, borderRadius: 0 },
    selected: { backgroundColor: t.colors.primary },
    pressed: { backgroundColor: t.colors.accent },
    disabled: { opacity: 0.5 },
    outside: { opacity: 0.5 },
  }),
  text: StyleSheet.create({
    day: { fontSize: t.fontSize.sm, color: t.colors.foreground },
    outside: { color: t.colors.mutedForeground },
    selected: { color: t.colors.primaryForeground },
    inRange: { color: t.colors.accentForeground },
  }),
});
