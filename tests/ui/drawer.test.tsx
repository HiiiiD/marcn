import { StyleSheet, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/registry/marcn/ui/drawer';
import { Sheet, SheetContent } from '@/registry/marcn/ui/sheet';

function setup(onOpenChange?: (o: boolean) => void) {
  return render(
    <PortalHost>
      <Drawer onOpenChange={onOpenChange}>
        <DrawerTrigger><Text>Open</Text></DrawerTrigger>
        <DrawerContent testID="drawer">
          <DrawerHeader>
            <DrawerTitle>Title</DrawerTitle>
            <DrawerDescription>Description</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose><Text>Done</Text></DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PortalHost>,
  );
}

test('opens from the trigger and closes with DrawerClose', () => {
  const onOpenChange = jest.fn();
  setup(onOpenChange);
  expect(screen.queryByText('Title')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByRole('header')).toHaveTextContent('Title');
  expect(screen.getByText('Description')).toBeOnTheScreen();
  fireEvent.press(screen.getByText('Done'));
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

test('is anchored to the bottom with a handle by default', () => {
  setup();
  fireEvent.press(screen.getByText('Open'));
  expect(StyleSheet.flatten(screen.getByTestId('drawer').props.style).bottom).toBe(0);
  expect(getByGestureTestId('sheet-handle')).toBeTruthy();
});

test('is the sheet', () => {
  expect(Drawer).toBe(Sheet);
  expect(DrawerContent).toBe(SheetContent);
});
