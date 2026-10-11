import { createRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { Tooltip, TooltipContent, TooltipTrigger, type TooltipContentProps, type TooltipProps } from '@/registry/marcn/ui/tooltip';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

function setup(root: TooltipProps = {}, content: TooltipContentProps = {}, measure?: Measure) {
  const ref = createRef<View>();
  const view = render(
    <PortalHost>
      <Text>App</Text>
      <Tooltip {...root}>
        <TooltipTrigger ref={ref} testID="trigger"><Text>Hold</Text></TooltipTrigger>
        <TooltipContent testID="tip" {...content}>Info</TooltipContent>
      </Tooltip>
    </PortalHost>,
  );
  if (measure) ref.current!.measureInWindow = measure as never;
  return { ref, view };
}

const holdOpen = () => fireEvent(screen.getByText('Hold'), 'longPress');
const release = () => fireEvent(screen.getByText('Hold'), 'pressOut');
const layout = (width: number, height: number) =>
  fireEvent(screen.getByTestId('tip'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });
const tipStyle = () => StyleSheet.flatten(screen.getByTestId('tip').props.style);

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('is closed by default and opens on long press', () => {
  setup();
  expect(screen.queryByText('Info')).toBeNull();
  holdOpen();
  expect(screen.getByText('Info')).toBeOnTheScreen();
});

test('stays open while held, closes duration ms after release', () => {
  setup({ duration: 1000 });
  holdOpen();
  act(() => { jest.advanceTimersByTime(5000); });
  expect(screen.getByText('Info')).toBeOnTheScreen();
  release();
  act(() => { jest.advanceTimersByTime(999); });
  expect(screen.getByText('Info')).toBeOnTheScreen();
  act(() => { jest.advanceTimersByTime(1); });
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('Info')).toBeNull();
});

test('a new long press cancels a pending close', () => {
  setup({ duration: 1000 });
  holdOpen();
  release();
  act(() => { jest.advanceTimersByTime(500); });
  holdOpen();
  act(() => { jest.advanceTimersByTime(1500); });
  expect(screen.getByText('Info')).toBeOnTheScreen();
});

test('a plain tap never opens it', () => {
  setup();
  fireEvent.press(screen.getByText('Hold'));
  release();
  act(() => { jest.advanceTimersByTime(3000); });
  expect(screen.queryByText('Info')).toBeNull();
});

test('releasing then unmounting with a pending timer is safe', () => {
  const onOpenChange = jest.fn();
  const { view } = setup({ onOpenChange });
  holdOpen();
  release();
  view.unmount();
  act(() => { jest.advanceTimersByTime(5000); });
  expect(onOpenChange).toHaveBeenCalledTimes(1);
});

test('controlled: follows the open prop and reports changes', () => {
  const onOpenChange = jest.fn();
  setup({ open: false, onOpenChange });
  holdOpen();
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(screen.queryByText('Info')).toBeNull();
});

test('defaultOpen starts open', () => {
  setup({ defaultOpen: true });
  expect(screen.getByText('Info')).toBeOnTheScreen();
});

test('is non-modal: no scrim, app stays accessible, taps pass through', () => {
  setup({ defaultOpen: true });
  expect(screen.queryByTestId('overlay-backdrop')).toBeNull();
  expect(isHiddenFromAccessibility(screen.getByText('App', { includeHiddenElements: true }))).toBe(false);
  expect(tipStyle().pointerEvents).toBe('none');
  expect(screen.getByTestId('tip').props.role).toBe('tooltip');
});

test('puts string content on the trigger as its accessibility hint, even while closed', () => {
  setup();
  expect(screen.getByTestId('trigger').props.accessibilityHint).toBe('Info');
});

test('positions above the trigger by default', () => {
  setup({ defaultOpen: true }, {}, (cb) => cb(100, 100, 100, 40));
  layout(80, 30);
  expect(tipStyle()).toMatchObject({ left: 110, top: 66 });
});

test('zero measurements never produce NaN', () => {
  setup({ defaultOpen: true }, {}, (cb) => cb(0, 0, 0, 0));
  layout(0, 0);
  const { left, top } = tipStyle();
  expect(Number.isFinite(left) && Number.isFinite(top)).toBe(true);
});

test('forwards ref to the trigger', () => {
  const { ref } = setup();
  expect(ref.current).not.toBeNull();
});

test('text content inherits the tooltip text style', () => {
  setup({ defaultOpen: true });
  expect(StyleSheet.flatten(screen.getByText('Info').props.style).color).toBe('#ffffff');
});

test('unmounting the trigger while open closes the tooltip', () => {
  const onOpenChange = jest.fn();
  const { view } = setup({ defaultOpen: true, onOpenChange });
  view.rerender(
    <PortalHost>
      <Text>App</Text>
      <Tooltip defaultOpen onOpenChange={onOpenChange}>
        <TooltipContent testID="tip">Info</TooltipContent>
      </Tooltip>
    </PortalHost>,
  );
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('the trigger hint is cleared when the content unmounts', () => {
  const { view } = setup();
  expect(screen.getByTestId('trigger').props.accessibilityHint).toBe('Info');
  view.rerender(
    <PortalHost>
      <Text>App</Text>
      <Tooltip>
        <TooltipTrigger testID="trigger"><Text>Hold</Text></TooltipTrigger>
      </Tooltip>
    </PortalHost>,
  );
  expect(screen.getByTestId('trigger').props.accessibilityHint).toBeUndefined();
});
