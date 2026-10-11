import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const TRACK_PADDING = 1;

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { position: 'relative', overflow: 'hidden' },
    track: { position: 'absolute', padding: TRACK_PADDING, pointerEvents: 'none' },
    vertical: { top: 0, bottom: 0, end: 0, width: 10 },
    horizontal: { start: 0, end: 0, bottom: 0, height: 10 },
    thumbVertical: { width: '100%', borderRadius: t.radius.full, backgroundColor: t.colors.border },
    thumbHorizontal: { height: '100%', borderRadius: t.radius.full, backgroundColor: t.colors.border },
  });
