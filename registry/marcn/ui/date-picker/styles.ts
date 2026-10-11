import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    trigger: { justifyContent: 'flex-start', paddingHorizontal: t.spacing[3] },
    label: { flexShrink: 1, fontWeight: t.fontWeight.normal },
    placeholder: { color: t.colors.mutedForeground },
  });
