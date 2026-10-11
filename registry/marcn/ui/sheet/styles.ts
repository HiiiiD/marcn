import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';
import { RUBBER_LIMIT } from '@/registry/marcn/ui/sheet/snap';

// Drawn behind the open edge so a stretched sheet never reveals a gap.
const STRETCH = RUBBER_LIMIT * 2;

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    surface: { position: 'absolute', backgroundColor: t.colors.background, borderColor: t.colors.border },
    bottom: {
      left: 0, right: 0, bottom: 0, maxHeight: '90%', flexDirection: 'column',
      borderTopWidth: 1, borderTopLeftRadius: t.radius.xl, borderTopRightRadius: t.radius.xl,
    },
    top: {
      left: 0, right: 0, top: 0, maxHeight: '90%', flexDirection: 'column',
      borderBottomWidth: 1, borderBottomLeftRadius: t.radius.xl, borderBottomRightRadius: t.radius.xl,
    },
    left: { top: 0, bottom: 0, left: 0, width: '75%', maxWidth: 384, flexDirection: 'row', borderRightWidth: 1 },
    right: { top: 0, bottom: 0, right: 0, width: '75%', maxWidth: 384, flexDirection: 'row', borderLeftWidth: 1 },
    body: { flexShrink: 1, flexGrow: 1, padding: t.spacing[4], gap: t.spacing[4] },
    bodyFit: { flexGrow: 0 },
    handleHit: { alignItems: 'center', justifyContent: 'center', padding: t.spacing[3] },
    handleBar: { borderRadius: t.radius.full, backgroundColor: t.colors.border },
    handleBarHorizontal: { width: 40, height: 4 },
    handleBarVertical: { width: 4, height: 40 },
    stretch: { position: 'absolute', backgroundColor: t.colors.background },
    stretchBottom: { top: '100%', left: 0, right: 0, height: STRETCH },
    stretchTop: { bottom: '100%', left: 0, right: 0, height: STRETCH },
    stretchLeft: { right: '100%', top: 0, bottom: 0, width: STRETCH },
    stretchRight: { left: '100%', top: 0, bottom: 0, width: STRETCH },
  });
