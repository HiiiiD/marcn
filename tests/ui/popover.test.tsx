import { createRef } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { Popover, PopoverContent, PopoverTrigger, type PopoverContentProps } from '@/registry/marcn/ui/popover';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

function setup(content: PopoverContentProps = {}, measure?: Measure) {
  const ref = createRef<View>();
  const view = render(
    <PortalHost>
      <Text>App</Text>
      <Popover>
        <PopoverTrigger ref={ref}><Text>Open</Text></PopoverTrigger>
        <PopoverContent testID="pop" {...content}><Text>Body</Text></PopoverContent>
      </Popover>
    </PortalHost>,
  );
  if (measure) ref.current!.measureInWindow = measure as never;
  return { ref, view };
}

const layout = (width = 80, height = 50) =>
  fireEvent(screen.getByTestId('pop'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });
const place = () => StyleSheet.flatten(screen.getByTestId('pop').props.style);
const appHidden = () => isHiddenFromAccessibility(screen.getByText('App', { includeHiddenElements: true }));

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('opens from the trigger', () => {
  setup();
  expect(screen.queryByText('Body')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByText('Body')).toBeOnTheScreen();
});

test('positions below the trigger once measured and laid out', () => {
  setup({}, (cb) => cb(100, 100, 100, 40));
  fireEvent.press(screen.getByText('Open'));
  layout();
  expect(place()).toMatchObject({ left: 110, top: 144 });
});

test('flips above when there is no room below', () => {
  setup({}, (cb) => cb(100, 1280, 100, 40));
  fireEvent.press(screen.getByText('Open'));
  layout();
  expect(place()).toMatchObject({ top: 1226 });
});

test('honors side, align and offsets', () => {
  setup({ side: 'right', align: 'start', sideOffset: 10, alignOffset: 5 }, (cb) => cb(100, 100, 100, 40));
  fireEvent.press(screen.getByText('Open'));
  layout();
  expect(place()).toMatchObject({ left: 210, top: 105 });
});

test('stays hidden when never measured', () => {
  setup({});
  fireEvent.press(screen.getByText('Open'));
  layout();
  expect(place().opacity).toBe(0);
});

test('zero measurements never produce NaN', () => {
  setup({}, (cb) => cb(0, 0, 0, 0));
  fireEvent.press(screen.getByText('Open'));
  layout(0, 0);
  const { left, top } = place();
  expect(Number.isFinite(left) && Number.isFinite(top)).toBe(true);
});

test('outside tap dismisses after the exit animation', () => {
  jest.useFakeTimers();
  setup({}, (cb) => cb(100, 100, 100, 40));
  fireEvent.press(screen.getByText('Open'));
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  expect(screen.getByText('Body')).toBeOnTheScreen();
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('Body')).toBeNull();
});

test('non-modal keeps the app accessible', () => {
  setup({ modal: false });
  fireEvent.press(screen.getByText('Open'));
  expect(appHidden()).toBe(false);
});

test('modal hides the app', () => {
  setup({ modal: true });
  fireEvent.press(screen.getByText('Open'));
  expect(appHidden()).toBe(true);
});

test('forwards ref to the surface', () => {
  const ref = createRef<View>();
  setup({ ref });
  fireEvent.press(screen.getByText('Open'));
  expect(ref.current).not.toBeNull();
});

test('stays invisible until placed even after the surface re-renders', () => {
  setup({});
  fireEvent.press(screen.getByText('Open'));
  layout();
  layout(81, 50);
  expect(place().opacity).toBe(0);
});

test('plain string content is wrapped in Text', () => {
  render(
    <PortalHost>
      <Popover defaultOpen>
        <PopoverContent>Hello</PopoverContent>
      </Popover>
    </PortalHost>,
  );
  expect(screen.getByText('Hello')).toBeOnTheScreen();
});

test('re-measures the anchor once the keyboard lift has settled', () => {
  jest.useFakeTimers();
  const handlers: Record<string, (e: unknown) => void> = {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, cb: (e: unknown) => void) => {
    handlers[event] = cb;
    return { remove: jest.fn() };
  }) as never);
  const measure = jest.fn((cb: (x: number, y: number, w: number, h: number) => void) => cb(100, 100, 100, 40));
  setup({}, measure as never);
  fireEvent.press(screen.getByText('Open'));
  const before = measure.mock.calls.length;
  act(() => handlers.keyboardWillChangeFrame({ endCoordinates: { screenY: 500, height: 300 } } as never));
  act(() => { jest.advanceTimersByTime(300); });
  expect(measure.mock.calls.length).toBeGreaterThan(before + 1);
});
