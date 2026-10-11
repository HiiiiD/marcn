import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Example() {
  const [bookmarks, setBookmarks] = useState(true);
  const [position, setPosition] = useState('bottom');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem>
          Profile<DropdownMenuShortcut>Shift+P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
          Show bookmarks
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
          <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
