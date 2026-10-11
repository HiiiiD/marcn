import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) => ({
  group: StyleSheet.create({
    root: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      width: '100%',
      minHeight: 36,
      borderWidth: 1,
      borderColor: t.colors.input,
      borderRadius: t.radius.md,
    },
    focused: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
  }),
  addon: StyleSheet.create({
    base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2] },
    'inline-start': { paddingStart: t.spacing[3] },
    'inline-end': { paddingEnd: t.spacing[3] },
    'block-start': { width: '100%', justifyContent: 'flex-start', paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2] },
    'block-end': { width: '100%', justifyContent: 'flex-start', paddingHorizontal: t.spacing[3], paddingVertical: t.spacing[2] },
  }),
  button: StyleSheet.create({
    xs: { height: 24, paddingHorizontal: t.spacing[2], borderRadius: t.radius.sm },
    sm: { height: 32, paddingHorizontal: t.spacing[3] },
    'icon-xs': { height: 24, width: 24, paddingHorizontal: 0, borderRadius: t.radius.sm },
    'icon-sm': { height: 32, width: 32, paddingHorizontal: 0 },
  }),
  text: StyleSheet.create({
    muted: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
  }),
  control: StyleSheet.create({
    bare: { flex: 1, minWidth: 0, borderWidth: 0, borderRadius: 0, backgroundColor: 'transparent' },
  }),
});
