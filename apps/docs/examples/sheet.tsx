import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Bottom</SheetTrigger>
        <SheetContent snapPoints={[0.4, 0.9]}>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Drag the handle to resize.</SheetDescription>
          </SheetHeader>
          <Input placeholder="Name" />
          <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
        </SheetContent>
      </Sheet>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>Right</SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Side sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </View>
  );
}
