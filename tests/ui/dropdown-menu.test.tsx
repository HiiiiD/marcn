import { createRef } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { Dialog, DialogContent } from '@/registry/marcn/ui/dialog';
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
  type DropdownMenuContentProps,
} from '@/registry/marcn/ui/dropdown-menu';
import { mockBackHandler } from '../back-handler';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

function setup(content: DropdownMenuContentProps = {}, children?: React.ReactNode, measure?: Measure) {
  const ref = createRef<View>();
  render(
    <PortalHost>
      <Text>App</Text>
      <DropdownMenu>
        <DropdownMenuTrigger ref={ref}><Text>Menu</Text></DropdownMenuTrigger>
        <DropdownMenuContent testID="menu" {...content}>{children}</DropdownMenuContent>
      </DropdownMenu>
    </PortalHost>,
  );
  if (measure) ref.current!.measureInWindow = measure as never;
  return ref;
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const open = () => fireEvent.press(screen.getByText('Menu'));
const settle = () => act(() => { jest.advanceTimersByTime(200); });
const layout = (width: number, height: number) =>
  fireEvent(screen.getByTestId('menu'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });

test('opens from the trigger; items have the menuitem role', () => {
  setup({}, <><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuItem>Billing</DropdownMenuItem></>);
  expect(screen.queryByText('Profile')).toBeNull();
  open();
  expect(screen.getAllByRole('menuitem')).toHaveLength(2);
});

test('selecting an item calls onSelect and closes after the exit animation', () => {
  jest.useFakeTimers();
  const onSelect = jest.fn();
  setup({}, <DropdownMenuItem onSelect={onSelect}>Profile</DropdownMenuItem>);
  open();
  fireEvent.press(screen.getByText('Profile'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  settle();
  expect(screen.queryByText('Profile')).toBeNull();
});

test('preventDefault in onSelect keeps the menu open', () => {
  jest.useFakeTimers();
  setup({}, <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Profile</DropdownMenuItem>);
  open();
  fireEvent.press(screen.getByText('Profile'));
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.getByText('Profile')).toBeOnTheScreen();
});

test('a disabled item neither selects nor closes', () => {
  jest.useFakeTimers();
  const onSelect = jest.fn();
  setup({}, <DropdownMenuItem disabled onSelect={onSelect}>Profile</DropdownMenuItem>);
  open();
  fireEvent.press(screen.getByText('Profile'));
  act(() => { jest.advanceTimersByTime(300); });
  expect(onSelect).not.toHaveBeenCalled();
  expect(screen.getByText('Profile')).toBeOnTheScreen();
  expect(screen.getByRole('menuitem')).toBeDisabled();
});

test('destructive items use the destructive text color', () => {
  setup({}, <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>);
  open();
  expect(StyleSheet.flatten(screen.getByText('Delete').props.style).color).toBe('#e7000b');
});

test('checkbox item reports the toggled value and reflects checked', () => {
  const onCheckedChange = jest.fn();
  setup({}, <DropdownMenuCheckboxItem checked onCheckedChange={onCheckedChange}>Status bar</DropdownMenuCheckboxItem>);
  open();
  expect(screen.getByRole('checkbox')).toBeChecked();
  fireEvent.press(screen.getByText('Status bar'));
  expect(onCheckedChange).toHaveBeenCalledWith(false);
});

test('radio group: uncontrolled selection and onValueChange', () => {
  const onValueChange = jest.fn();
  setup(
    {},
    <DropdownMenuRadioGroup defaultValue="top" onValueChange={onValueChange}>
      <DropdownMenuRadioItem value="top" onSelect={(e) => e.preventDefault()}>Top</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="bottom" onSelect={(e) => e.preventDefault()}>Bottom</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>,
  );
  open();
  expect(screen.getByRole('radio', { checked: true })).toHaveTextContent('Top');
  fireEvent.press(screen.getByText('Bottom'));
  expect(onValueChange).toHaveBeenCalledWith('bottom');
  expect(screen.getByRole('radio', { checked: true })).toHaveTextContent('Bottom');
});

test('radio group: controlled value only follows the prop', () => {
  setup(
    {},
    <DropdownMenuRadioGroup value="top">
      <DropdownMenuRadioItem value="top" onSelect={(e) => e.preventDefault()}>Top</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="bottom" onSelect={(e) => e.preventDefault()}>Bottom</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>,
  );
  open();
  fireEvent.press(screen.getByText('Bottom'));
  expect(screen.getByRole('radio', { checked: true })).toHaveTextContent('Top');
});

test('renders label, group, separator and shortcut parts', () => {
  setup(
    {},
    <>
      <DropdownMenuLabel>My account</DropdownMenuLabel>
      <DropdownMenuSeparator testID="sep" />
      <DropdownMenuGroup>
        <DropdownMenuItem>Profile<DropdownMenuShortcut>Shift+P</DropdownMenuShortcut></DropdownMenuItem>
      </DropdownMenuGroup>
    </>,
  );
  open();
  expect(screen.getByText('My account')).toBeOnTheScreen();
  expect(screen.getByTestId('sep', { includeHiddenElements: true })).toBeOnTheScreen();
  expect(screen.getByText('Shift+P')).toBeOnTheScreen();
});

test('backdrop and Android back dismiss', () => {
  jest.useFakeTimers();
  const back = mockBackHandler();
  setup({}, <DropdownMenuItem>Profile</DropdownMenuItem>);
  open();
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  expect(screen.queryByText('Profile')).toBeNull();
  open();
  act(() => { back.press(); });
  settle();
  expect(screen.queryByText('Profile')).toBeNull();
});

test('dismissable=false ignores the backdrop', () => {
  jest.useFakeTimers();
  setup({ dismissable: false }, <DropdownMenuItem>Profile</DropdownMenuItem>);
  open();
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.getByText('Profile')).toBeOnTheScreen();
});

test('is modal for screen readers: hides the app', () => {
  setup({}, <DropdownMenuItem>Profile</DropdownMenuItem>);
  open();
  expect(isHiddenFromAccessibility(screen.getByText('App', { includeHiddenElements: true }))).toBe(true);
});

test('positions below the trigger, start-aligned', () => {
  setup({}, <DropdownMenuItem>Profile</DropdownMenuItem>, (cb) => cb(100, 100, 100, 40));
  open();
  layout(80, 50);
  expect(StyleSheet.flatten(screen.getByTestId('menu').props.style)).toMatchObject({ left: 100, top: 144 });
});

test('a tall menu is capped so it can scroll', () => {
  setup({}, <DropdownMenuItem>Profile</DropdownMenuItem>);
  open();
  const scroll = screen.UNSAFE_getByType(ScrollView);
  expect(StyleSheet.flatten(scroll.props.style).maxHeight).toBeGreaterThan(0);
});

test('zero measurements never produce NaN', () => {
  setup({}, <DropdownMenuItem>Profile</DropdownMenuItem>, (cb) => cb(0, 0, 0, 0));
  open();
  layout(0, 0);
  const { left, top } = StyleSheet.flatten(screen.getByTestId('menu').props.style);
  expect(Number.isFinite(left) && Number.isFinite(top)).toBe(true);
});

test('forwards ref to the surface', () => {
  const ref = createRef<View>();
  setup({ ref }, <DropdownMenuItem>Profile</DropdownMenuItem>);
  open();
  expect(ref.current).not.toBeNull();
});

test('opened from inside a Dialog it closes only itself', () => {
  jest.useFakeTimers();
  render(
    <PortalHost>
      <Dialog defaultOpen>
        <DialogContent>
          <Text>Dialog body</Text>
          <DropdownMenu>
            <DropdownMenuTrigger><Text>Menu</Text></DropdownMenuTrigger>
            <DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem></DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>
    </PortalHost>,
  );
  fireEvent.press(screen.getByText('Menu'));
  fireEvent.press(screen.getByText('Profile'));
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.queryByText('Profile')).toBeNull();
  expect(screen.getByText('Dialog body')).toBeOnTheScreen();
});

function subMenu(onSelect = jest.fn()) {
  setup(
    {},
    <>
      <DropdownMenuItem>Top item</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onSelect={onSelect}>Nested</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>,
  );
  open();
  return onSelect;
}

test('sub-trigger opens the sub-menu without closing the parent', () => {
  subMenu();
  expect(screen.queryByText('Nested')).toBeNull();
  fireEvent.press(screen.getByText('More'));
  expect(screen.getByText('Nested')).toBeOnTheScreen();
  expect(screen.getByText('Top item', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('selecting a nested item closes the whole menu', () => {
  jest.useFakeTimers();
  const onSelect = subMenu();
  fireEvent.press(screen.getByText('More'));
  fireEvent.press(screen.getByText('Nested'));
  expect(onSelect).toHaveBeenCalledTimes(1);
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.queryByText('Nested')).toBeNull();
  expect(screen.queryByText('Top item')).toBeNull();
});

test('back closes only the sub-menu', () => {
  jest.useFakeTimers();
  const back = mockBackHandler();
  subMenu();
  fireEvent.press(screen.getByText('More'));
  act(() => { back.press(); });
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.queryByText('Nested')).toBeNull();
  expect(screen.getByText('Top item', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('the sub-trigger reports expanded state', () => {
  subMenu();
  const expanded = () => screen.queryByRole('menuitem', { expanded: true, includeHiddenElements: true });
  expect(expanded()).toBeNull();
  fireEvent.press(screen.getByText('More'));
  expect(expanded()).toHaveTextContent('More');
});

test('checked and unchecked rows reserve the same indicator space', () => {
  setup(
    {},
    <>
      <DropdownMenuCheckboxItem checked>On</DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem>Off</DropdownMenuCheckboxItem>
      <DropdownMenuRadioGroup defaultValue="a">
        <DropdownMenuRadioItem value="a" onSelect={(e) => e.preventDefault()}>A</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="b" onSelect={(e) => e.preventDefault()}>B</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>,
  );
  open();
  const left = (role: 'checkbox' | 'radio', label: string) => StyleSheet.flatten(screen.getByRole(role, { name: label }).props.style).paddingLeft;
  expect(left('checkbox', 'Off')).toBe(left('checkbox', 'On'));
  expect(left('radio', 'B')).toBe(left('radio', 'A'));
  expect(left('checkbox', 'On')).toBeGreaterThan(8);
});

test('string children next to other elements are wrapped in Text, not left as raw strings', () => {
  setup({}, <DropdownMenuItem>Profile<DropdownMenuShortcut>Shift+P</DropdownMenuShortcut></DropdownMenuItem>);
  open();
  expect(screen.getByText('Profile')).toBeOnTheScreen();
  expect(screen.getByText('Shift+P')).toBeOnTheScreen();
});

test('an outside tap while a sub-menu is open closes the whole menu', () => {
  jest.useFakeTimers();
  subMenu();
  fireEvent.press(screen.getByText('More'));
  const backdrops = screen.getAllByTestId('overlay-backdrop');
  fireEvent.press(backdrops[backdrops.length - 1]);
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.queryByText('Nested')).toBeNull();
  expect(screen.queryByText('Top item', { includeHiddenElements: true })).toBeNull();
});

test('a consumer accessibilityState keeps the checked state', () => {
  setup(
    {},
    <>
      <DropdownMenuCheckboxItem checked accessibilityState={{ busy: true }}>On</DropdownMenuCheckboxItem>
      <DropdownMenuRadioGroup defaultValue="a">
        <DropdownMenuRadioItem value="a" accessibilityState={{ busy: true }}>A</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>,
  );
  open();
  expect(screen.getByRole('checkbox', { checked: true, busy: true })).toBeOnTheScreen();
  expect(screen.getByRole('radio', { checked: true, busy: true })).toBeOnTheScreen();
});

test('items accept a render prop', () => {
  setup({}, <DropdownMenuItem render={<Pressable testID="custom" />}>Profile</DropdownMenuItem>);
  open();
  expect(screen.getByTestId('custom')).toHaveTextContent('Profile');
  expect(screen.getByRole('menuitem')).toBe(screen.getByTestId('custom'));
});

test('the list height leaves room for the surface padding and border', () => {
  setup({}, <DropdownMenuItem>Profile</DropdownMenuItem>);
  open();
  const { height } = Dimensions.get('window');
  expect(StyleSheet.flatten(screen.UNSAFE_getByType(ScrollView).props.style).maxHeight).toBe(height - 16 - 10);
});
