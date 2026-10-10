import { useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup,
  ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';
import { Section } from './Section';

export function ContextMenus() {
  const { colors, radius } = useTheme();
  const [bookmarks, setBookmarks] = useState(true);
  const [person, setPerson] = useState('pedro');
  const [last, setLast] = useState('none');
  return (
    <Section title="Context menu">
      <ContextMenu>
        <ContextMenuTrigger style={[styles.area, { borderColor: colors.border, borderRadius: radius.md }]}>
          <Text>Long-press anywhere in this box</Text>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLast('Back')}>
            Back<ContextMenuShortcut>Alt+←</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLast('Reload')}>Reload</ContextMenuItem>
          <ContextMenuItem variant="destructive" onSelect={() => setLast('Delete')}>Delete</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks} onSelect={(e) => e.preventDefault()}>
            Show bookmarks
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value={person} onValueChange={setPerson}>
            <ContextMenuRadioItem value="pedro" onSelect={(e) => e.preventDefault()}>Pedro</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm" onSelect={(e) => e.preventDefault()}>Colm</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
      <Text variant="muted">Last action: {last}</Text>
    </Section>
  );
}

const styles = StyleSheet.create({
  area: { height: 140, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed' },
});
