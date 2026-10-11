import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';
import { HIT, THUMB, TRACK } from '@/registry/marcn/ui/slider/constants';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    horizontal: { height: HIT, justifyContent: 'center' },
    vertical: { width: HIT, alignItems: 'center' },
    track: { overflow: 'hidden', borderRadius: t.radius.full, backgroundColor: t.colors.muted },
    trackH: { height: TRACK, width: '100%' },
    trackV: { width: TRACK, height: '100%' },
    range: { position: 'absolute', backgroundColor: t.colors.primary },
    thumb: {
      position: 'absolute',
      width: THUMB,
      height: THUMB,
      borderRadius: t.radius.full,
      borderWidth: 1,
      borderColor: t.colors.primary,
      backgroundColor: t.colors.background,
    },
    disabled: { opacity: 0.5 },
  });
