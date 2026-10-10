import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const outline = <Button variant="outline" />;

function Details() {
  return (
    <Popover>
      <PopoverTrigger render={outline}>Popover</PopoverTrigger>
      <PopoverContent>
        <Text>Dimensions</Text>
        <Input placeholder="Width" />
      </PopoverContent>
    </Popover>
  );
}

function Profile() {
  return (
    <Dialog>
      <DialogTrigger render={outline}>Dialog (stacked)</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Type to check keyboard avoidance.</DialogDescription>
        </DialogHeader>
        <Input placeholder="Name" />
        <Details />
        <DialogFooter>
          <DialogClose render={outline}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Overlays() {
  return (
    <Section title="Overlays">
      <View style={styles.row}>
        <Dialog>
          <DialogTrigger render={outline}>Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>This is a centered dialog.</DialogDescription>
            </DialogHeader>
            <Input placeholder="Type here" />
            <DialogFooter>
              <DialogClose render={outline}>Cancel</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Details />
        <Sheet>
          <SheetTrigger render={outline}>Sheet (stacking)</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet</SheetTitle>
              <SheetDescription>Open the dialog, then the popover inside it.</SheetDescription>
            </SheetHeader>
            <Input placeholder="Search" />
            <Profile />
            <SheetClose render={outline}>Close sheet</SheetClose>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger render={outline}>Sheet (snap points)</SheetTrigger>
          <SheetContent snapPoints={[0.3, 0.6, 0.9]}>
            <SheetHeader>
              <SheetTitle>Snap points</SheetTitle>
              <SheetDescription>Drag the handle: it snaps to 30%, 60% and 90%, stretches past the top and springs back.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger render={outline}>Sheet (right)</SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Side sheet</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
});
