import { StyleSheet } from 'react-native';
import type { Theme } from '@/registry/marcn/lib/theme';

export const createStyles = (t: Theme) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    joined: { alignSelf: 'flex-start', overflow: 'hidden', borderRadius: t.radius.md },
    joinedOutline: { borderWidth: 1, borderColor: t.colors.input },
    // The first item's left border is shifted out of the clipped root so only the separators between items remain.
    joinedRowOutline: { marginLeft: -1 },
    joinedItem: { borderRadius: 0 },
    joinedItemOutline: { borderWidth: 0, borderLeftWidth: 1 },
  });
