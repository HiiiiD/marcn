import { useState } from 'react';
import { View } from 'react-native';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

export default function Example() {
  const { colors, radius } = useTheme();
  const [bookmarks, setBookmarks] = useState(true);
  const [last, setLast] = useState('none');
  return (
    <View style={{ gap: 8 }}>
      <ContextMenu>
        <ContextMenuTrigger
          style={{
            height: 140,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.border,
            borderRadius: radius.md,
          }}>
          <Text>Right-click or long-press here</Text>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLast('Back')}>
            Back<ContextMenuShortcut>Alt+←</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onSelect={() => setLast('Delete')}>Delete</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={bookmarks}
            onCheckedChange={setBookmarks}
            onSelect={(e) => e.preventDefault()}>
            Show bookmarks
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>
      <Text variant="muted">Last action: {last}</Text>
    </View>
  );
}
