import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Section } from './Section';

const outline = <Button variant="outline" />;

function FruitSelect() {
  return (
    <Select defaultValue="apple">
      <SelectTrigger style={styles.select}>
        <SelectValue placeholder="Pick a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="cherry" disabled>Cherry</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const numbers = Array.from({ length: 300 }, (_, i) => `Item ${i + 1}`);

function LongSelect() {
  return (
    <Select defaultValue="Item 150">
      <SelectTrigger style={styles.select}>
        <SelectValue placeholder="Pick one" />
      </SelectTrigger>
      <SelectContent>
        {numbers.map((n) => (
          <SelectItem key={n} value={n}>{n}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Actions() {
  const [bookmarks, setBookmarks] = useState(true);
  const [position, setPosition] = useState('bottom');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={outline}>Dropdown menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem>Profile<DropdownMenuShortcut>Shift+P</DropdownMenuShortcut></DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>Show bookmarks</DropdownMenuCheckboxItem>
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

export function Menus() {
  return (
    <Section title="Menus">
      <View style={styles.row}>
        <Actions />
        <FruitSelect />
        <LongSelect />
        <Tooltip>
          <TooltipTrigger render={outline}>Long-press me</TooltipTrigger>
          <TooltipContent>Add to library</TooltipContent>
        </Tooltip>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>Alert dialog</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog>
          <DialogTrigger render={outline}>Select in dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Stacking check</DialogTitle></DialogHeader>
            <FruitSelect />
          </DialogContent>
        </Dialog>
        <Sheet>
          <SheetTrigger render={outline}>Menu in sheet</SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Stacking check</SheetTitle></SheetHeader>
            <Actions />
          </SheetContent>
        </Sheet>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  select: { minWidth: 160 },
});
