import { createRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import {
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup,
  ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
  type ContextMenuProps, type ContextMenuTriggerProps,
} from '@/registry/marcn/ui/context-menu';

function setup(children?: React.ReactNode, trigger: ContextMenuTriggerProps = {}, root: ContextMenuProps = {}) {
  const ref = createRef<View>();
  render(
    <PortalHost>
      <Text>App</Text>
      <ContextMenu {...root}>
        <ContextMenuTrigger ref={ref} {...trigger}><Text>Area</Text></ContextMenuTrigger>
        <ContextMenuContent testID="menu">{children}</ContextMenuContent>
      </ContextMenu>
    </PortalHost>,
  );
  return ref;
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const longPress = (x = 40, y = 70) => fireEvent(screen.getByText('Area'), 'longPress', { nativeEvent: { pageX: x, pageY: y } });
const settle = () => act(() => { jest.advanceTimersByTime(300); });
const layout = (width: number, height: number) =>
  fireEvent(screen.getByTestId('menu'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });
const place = () => StyleSheet.flatten(screen.getByTestId('menu').props.style);

test('long press opens the menu at the touch point', () => {
  setup(<ContextMenuItem>Copy</ContextMenuItem>);
  expect(screen.queryByText('Copy')).toBeNull();
  longPress(40, 70);
  layout(80, 50);
  expect(screen.getByRole('menuitem')).toBeOnTheScreen();
  expect(place()).toMatchObject({ left: 40, top: 70 });
});

test('a short press does not open and still calls onPress', () => {
  const onPress = jest.fn();
  setup(<ContextMenuItem>Copy</ContextMenuItem>, { onPress });
  fireEvent.press(screen.getByText('Area'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('Copy')).toBeNull();
});

test('a disabled trigger ignores long press', () => {
  setup(<ContextMenuItem>Copy</ContextMenuItem>, { disabled: true });
  longPress();
  expect(screen.queryByText('Copy')).toBeNull();
});

test('calls the caller onLongPress', () => {
  const onLongPress = jest.fn();
  setup(<ContextMenuItem>Copy</ContextMenuItem>, { onLongPress });
  longPress();
  expect(onLongPress).toHaveBeenCalledTimes(1);
});

test('reopening at a new spot re-anchors the menu', () => {
  jest.useFakeTimers();
  setup(<ContextMenuItem>Copy</ContextMenuItem>);
  longPress(10, 10);
  layout(80, 50);
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  longPress(100, 200);
  layout(80, 50);
  expect(place()).toMatchObject({ left: 100, top: 200 });
});

test('a point near the bottom-right edge stays inside the window', () => {
  setup(<ContextMenuItem>Copy</ContextMenuItem>);
  longPress(1000, 2000);
  layout(80, 50);
  const { left, top } = place();
  expect(left).toBeLessThan(1000);
  expect(top).toBeLessThan(2000);
});

test('selecting an item calls onSelect and closes', () => {
  jest.useFakeTimers();
  const onSelect = jest.fn();
  setup(<ContextMenuItem onSelect={onSelect}>Copy</ContextMenuItem>);
  longPress();
  fireEvent.press(screen.getByText('Copy'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  settle();
  expect(screen.queryByText('Copy')).toBeNull();
});

test('preventDefault in onSelect keeps the menu open', () => {
  jest.useFakeTimers();
  setup(<ContextMenuItem onSelect={(e) => e.preventDefault()}>Copy</ContextMenuItem>);
  longPress();
  fireEvent.press(screen.getByText('Copy'));
  settle();
  expect(screen.getByText('Copy')).toBeOnTheScreen();
});

test('a backdrop press dismisses', () => {
  jest.useFakeTimers();
  setup(<ContextMenuItem>Copy</ContextMenuItem>);
  longPress();
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  expect(screen.queryByText('Copy')).toBeNull();
});

test('checkbox item reports the toggled value', () => {
  const onCheckedChange = jest.fn();
  setup(<ContextMenuCheckboxItem checked onCheckedChange={onCheckedChange}>Bookmarks</ContextMenuCheckboxItem>);
  longPress();
  expect(screen.getByRole('checkbox')).toBeChecked();
  fireEvent.press(screen.getByText('Bookmarks'));
  expect(onCheckedChange).toHaveBeenCalledWith(false);
});

test('radio group selects and reports the value', () => {
  const onValueChange = jest.fn();
  setup(
    <ContextMenuRadioGroup defaultValue="a" onValueChange={onValueChange}>
      <ContextMenuRadioItem value="a" onSelect={(e) => e.preventDefault()}>A</ContextMenuRadioItem>
      <ContextMenuRadioItem value="b" onSelect={(e) => e.preventDefault()}>B</ContextMenuRadioItem>
    </ContextMenuRadioGroup>,
  );
  longPress();
  fireEvent.press(screen.getByText('B'));
  expect(onValueChange).toHaveBeenCalledWith('b');
  expect(screen.getByRole('radio', { checked: true })).toHaveTextContent('B');
});

test('renders label, separator and shortcut parts', () => {
  setup(
    <>
      <ContextMenuLabel>Actions</ContextMenuLabel>
      <ContextMenuSeparator testID="sep" />
      <ContextMenuItem>Copy<ContextMenuShortcut>Ctrl+C</ContextMenuShortcut></ContextMenuItem>
    </>,
  );
  longPress();
  expect(screen.getByText('Actions')).toBeOnTheScreen();
  expect(screen.getByTestId('sep', { includeHiddenElements: true })).toBeOnTheScreen();
  expect(screen.getByText('Ctrl+C')).toBeOnTheScreen();
});

test('the accessibility action opens the menu anchored to the trigger, ignoring a stale point', () => {
  jest.useFakeTimers();
  const ref = setup(<ContextMenuItem>Copy</ContextMenuItem>);
  ref.current!.measureInWindow = ((cb: (x: number, y: number, w: number, h: number) => void) => cb(10, 20, 100, 40)) as never;
  longPress(300, 300);
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  expect(screen.queryByText('Copy')).toBeNull();
  fireEvent(screen.getByText('Area'), 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
  layout(80, 50);
  expect(screen.getByText('Copy')).toBeOnTheScreen();
  expect(place()).toMatchObject({ left: 10, top: 60 });
});

test('the trigger exposes the Open menu action and the expanded state', () => {
  setup(<ContextMenuItem>Copy</ContextMenuItem>);
  const trigger = screen.getByText('Area').parent!.parent!;
  expect(trigger.props.accessibilityActions).toEqual([{ name: 'activate', label: 'Open menu' }]);
  expect(trigger.props.accessibilityState).toMatchObject({ expanded: false });
});

test('render prop element and ref reach the host', () => {
  const ref = setup(<ContextMenuItem>Copy</ContextMenuItem>, { render: <View testID="host" /> });
  expect(screen.getByTestId('host')).toBeOnTheScreen();
  expect(ref.current).toBeTruthy();
});

test('controlled open prop renders without a long press', () => {
  setup(<ContextMenuItem>Copy</ContextMenuItem>, {}, { open: true });
  expect(screen.getByText('Copy')).toBeOnTheScreen();
});
