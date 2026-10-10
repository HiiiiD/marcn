import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { clearToasts, getToasts } from '@/registry/marcn/lib/toast-store';
import { TOAST_EXIT_MS } from '@/registry/marcn/lib/toast-view';
import { Toaster, toast, type ToasterProps } from '@/registry/marcn/ui/sonner';

const mount = (props: ToasterProps = {}) =>
  render(
    <PortalHost>
      <Text>App</Text>
      <Toaster {...props} />
    </PortalHost>,
  );

beforeEach(() => {
  clearToasts();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

const flush = (ms = 0) => act(() => { jest.advanceTimersByTime(ms); });
const node = (index: number) => screen.getByTestId(`toast-${getToasts()[index].id}`);
const pointer = (index: number) => StyleSheet.flatten(node(index).props.style).pointerEvents;

test('renders nothing until a toast is fired, then shows it', () => {
  mount();
  expect(screen.queryByText('Hello')).toBeNull();
  act(() => { toast('Hello'); });
  expect(screen.getByText('Hello')).toBeOnTheScreen();
});

test('a toast fired before the Toaster mounts shows once it mounts', () => {
  toast('Early');
  mount();
  expect(screen.getByText('Early')).toBeOnTheScreen();
});

test('toast() without any PortalHost does not crash', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  render(<Toaster />);
  expect(() => act(() => { toast('x'); })).not.toThrow();
  warn.mockRestore();
});

test.each(['success', 'error', 'info', 'warning', 'loading'] as const)('toast.%s sets the type', (type) => {
  mount();
  act(() => { toast[type]('Msg'); });
  expect(getToasts()[0].type).toBe(type);
});

test('description and returned id; same id updates in place', () => {
  mount();
  let id!: string | number;
  act(() => { id = toast('First', { description: 'desc' }); });
  expect(screen.getByText('desc')).toBeOnTheScreen();
  act(() => { toast('Second', { id }); });
  expect(screen.queryByText('First')).toBeNull();
  expect(screen.getByText('Second')).toBeOnTheScreen();
  expect(getToasts()).toHaveLength(1);
});

test('toast.dismiss(id) removes after the exit animation; no id clears all', () => {
  mount();
  let id!: string | number;
  act(() => { id = toast('A'); toast('B'); });
  act(() => { toast.dismiss(id); });
  flush(TOAST_EXIT_MS);
  expect(screen.queryByText('A')).toBeNull();
  expect(screen.getByText('B')).toBeOnTheScreen();
  act(() => { toast.dismiss(); });
  flush(TOAST_EXIT_MS);
  expect(screen.queryByText('B')).toBeNull();
});

test('auto-closes and is removed', () => {
  mount();
  act(() => { toast('Bye', { duration: 1000 }); });
  flush(1000);
  flush(TOAST_EXIT_MS);
  expect(screen.queryByText('Bye')).toBeNull();
});

test('toast.custom renders the caller view and can dismiss itself', () => {
  mount();
  act(() => {
    toast.custom((id) => <Text onPress={() => toast.dismiss(id)}>Custom view</Text>);
  });
  fireEvent.press(screen.getByText('Custom view'));
  flush(TOAST_EXIT_MS);
  expect(screen.queryByText('Custom view')).toBeNull();
});

test('promise: loading, then success', async () => {
  mount();
  let resolve!: (v: string) => void;
  const promise = new Promise<string>((r) => { resolve = r; });
  act(() => { toast.promise(promise, { loading: 'Saving', success: (v) => `Saved ${v}`, error: 'Failed' }); });
  expect(screen.getByText('Saving')).toBeOnTheScreen();
  await act(async () => { resolve('doc'); });
  expect(screen.getByText('Saved doc')).toBeOnTheScreen();
  expect(getToasts()).toHaveLength(1);
  expect(getToasts()[0].type).toBe('success');
});

test('promise: rejection passes the raw reason to the error message', async () => {
  mount();
  const error = jest.fn((reason: unknown) => `Failed: ${String(reason)}`);
  const promise = Promise.reject('nope');
  act(() => { toast.promise(promise, { loading: 'Saving', success: 'ok', error }); });
  await act(async () => { await promise.catch(() => {}); });
  expect(error).toHaveBeenCalledWith('nope');
  expect(screen.getByText('Failed: nope')).toBeOnTheScreen();
  expect(getToasts()[0].type).toBe('error');
});

test('a promise that settles right away ends in one toast with the final state', async () => {
  mount();
  const promise = Promise.resolve(1);
  act(() => { toast.promise(promise, { loading: 'L', success: 'S', error: 'E' }); });
  await act(async () => { await promise; });
  expect(getToasts()).toHaveLength(1);
  expect(getToasts()[0].title).toBe('S');
});

test('toast.promise accepts a function returning the promise', async () => {
  mount();
  const fn = jest.fn(() => Promise.resolve('x'));
  await act(async () => { toast.promise(fn, { loading: 'L', success: 'S', error: 'E' }); });
  expect(fn).toHaveBeenCalledTimes(1);
  expect(getToasts()[0].title).toBe('S');
});

test('only the front toast is touchable when collapsed; tapping expands, tapping again collapses', () => {
  mount();
  act(() => { toast('one'); toast('two'); });
  expect(pointer(0)).toBe('none');
  expect(pointer(1)).toBe('auto');
  fireEvent.press(screen.getByText('two'));
  expect(pointer(0)).toBe('auto');
  fireEvent.press(screen.getByText('two'));
  expect(pointer(0)).toBe('none');
});

test('beyond visibleToasts, extras stay inert even when expanded, but still expire', () => {
  mount({ visibleToasts: 2 });
  act(() => { toast('one', { duration: 1000 }); toast('two', { duration: 1000 }); toast('three', { duration: 1000 }); });
  fireEvent.press(screen.getByText('three'));
  expect(pointer(0)).toBe('none');
  expect(pointer(1)).toBe('auto');
  expect(getToasts()).toHaveLength(3);
  flush(5000);
  flush(1000);
  flush(TOAST_EXIT_MS);
  expect(getToasts()).toHaveLength(0);
});

test('an expanded stack pauses timers, then collapses on idle so toasts can expire', () => {
  mount();
  act(() => { toast('one', { duration: 1000 }); toast('two', { duration: 1000 }); });
  fireEvent.press(screen.getByText('two'));
  flush(3000);
  expect(getToasts().every((t) => !t.dismissed)).toBe(true);
  flush(5000);
  flush(1000);
  flush(TOAST_EXIT_MS);
  expect(getToasts()).toHaveLength(0);
});

test('after everything is dismissed a new stack starts collapsed', () => {
  mount();
  act(() => { toast('a'); toast('b'); });
  fireEvent.press(screen.getByText('b'));
  act(() => { toast.dismiss(); });
  flush(TOAST_EXIT_MS);
  act(() => { toast('c'); toast('d'); });
  expect(pointer(0)).toBe('none');
});

test('unmounting the Toaster with live toasts leaves no pending timers or warnings', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  const view = mount();
  act(() => { toast('x'); });
  view.unmount();
  flush(10000);
  expect(error).not.toHaveBeenCalled();
  error.mockRestore();
});
