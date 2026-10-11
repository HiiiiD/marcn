import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) => {
  const text = { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium };
  return {
    base: StyleSheet.create({
      root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.spacing[2], borderRadius: t.radius.md },
      on: { backgroundColor: t.colors.accent },
      touch: { backgroundColor: t.colors.muted },
      disabled: { opacity: 0.5 },
    }),
    variant: StyleSheet.create({
      default: { backgroundColor: 'transparent' },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.colors.input },
    }),
    size: StyleSheet.create({
      default: { height: 36, minWidth: 36, paddingHorizontal: t.spacing[2] },
      sm: { height: 32, minWidth: 32, paddingHorizontal: 6 },
      lg: { height: 40, minWidth: 40, paddingHorizontal: 10 },
    }),
    text: StyleSheet.create({
      off: { ...text, color: t.colors.foreground },
      on: { ...text, color: t.colors.accentForeground },
    }),
  };
};
