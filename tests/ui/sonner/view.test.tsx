import { StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { TOAST_EXIT_MS, ToastView, type ToastViewProps } from '@/registry/marcn/ui/sonner/view';
import { clearToasts, dismissToast, getToasts, upsertToast, type ToastInput } from '@/registry/marcn/ui/sonner/store';

const layout = { translateY: 0, scale: 1, opacity: 1, zIndex: 10, interactive: true };

function show(input: ToastInput, props: Partial<ToastViewProps> = {}) {
  const id = upsertToast(input);
  const view = () => {
    const toast = getToasts().find((t) => t.id === id)!;
    return (
      <ToastView toast={toast} layout={layout} position="bottom" duration={4000} paused={false}
        onMeasure={jest.fn()} onTouch={jest.fn()} onTap={jest.fn()} {...props} />
    );
  };
  const utils = render(view());
  return { id, ...utils, refresh: () => utils.rerender(view()) };
}

beforeEach(() => {
  clearToasts();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

test('renders title and description', () => {
  show({ type: 'default', title: 'Saved', description: 'All good' });
  expect(screen.getByText('Saved')).toBeOnTheScreen();
  expect(screen.getByText('All good')).toBeOnTheScreen();
});

test('live region is polite, assertive for errors', () => {
  const a = show({ type: 'default', title: 'a' });
  expect(screen.getByTestId(`toast-${a.id}`)).toHaveProp('accessibilityLiveRegion', 'polite');
  a.unmount();
  const b = show({ type: 'error', title: 'b' });
  expect(screen.getByTestId(`toast-${b.id}`)).toHaveProp('accessibilityLiveRegion', 'assertive');
});

test('loading shows a progress indicator and never auto-closes', () => {
  const { id } = show({ type: 'loading', title: 'Working' });
  expect(screen.getByTestId(`toast-${id}-loading`)).toBeOnTheScreen();
  act(() => { jest.advanceTimersByTime(60000); });
  expect(getToasts()[0].dismissed).toBe(false);
});

test('auto-closes after the default duration and reports onAutoClose', () => {
  const onAutoClose = jest.fn();
  const { id } = show({ type: 'default', title: 'x', onAutoClose });
  act(() => { jest.advanceTimersByTime(3999); });
  expect(getToasts()[0].dismissed).toBe(false);
  act(() => { jest.advanceTimersByTime(1); });
  expect(getToasts()[0].dismissed).toBe(true);
  expect(onAutoClose).toHaveBeenCalledWith(id);
});

test('a per-toast duration overrides the default; Infinity persists', () => {
  show({ type: 'default', title: 'x', duration: 100 });
  act(() => { jest.advanceTimersByTime(100); });
  expect(getToasts()[0].dismissed).toBe(true);
  clearToasts();
  show({ type: 'default', title: 'y', duration: Infinity });
  act(() => { jest.advanceTimersByTime(100000); });
  expect(getToasts()[0].dismissed).toBe(false);
});

test('loading ignores an explicit duration', () => {
  show({ type: 'loading', title: 'x', duration: 100 });
  act(() => { jest.advanceTimersByTime(60000); });
  expect(getToasts()[0].dismissed).toBe(false);
});

test('releases its touch when it unmounts so the stack cannot stay paused', () => {
  const onTouch = jest.fn();
  const { id, unmount } = show({ type: 'default', title: 'x' }, { onTouch });
  unmount();
  expect(onTouch).toHaveBeenCalledWith(id, false);
});

test('paused toasts do not expire', () => {
  show({ type: 'default', title: 'x' }, { paused: true });
  act(() => { jest.advanceTimersByTime(60000); });
  expect(getToasts()[0].dismissed).toBe(false);
});

test('action runs its handler then dismisses as a user close', () => {
  const onPress = jest.fn();
  const onDismiss = jest.fn();
  show({ type: 'default', title: 'x', action: { label: 'Undo', onPress }, onDismiss });
  fireEvent.press(screen.getByText('Undo'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(getToasts()[0].dismissed).toBe(true);
});

test('cancel dismisses and calls its optional handler', () => {
  const onPress = jest.fn();
  show({ type: 'default', title: 'x', cancel: { label: 'Close', onPress } });
  fireEvent.press(screen.getByText('Close'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(getToasts()[0].dismissed).toBe(true);
});

test('custom renders in place of the default body', () => {
  show({ type: 'default', title: 'ignored', custom: () => <Text>custom body</Text> });
  expect(screen.getByText('custom body')).toBeOnTheScreen();
  expect(screen.queryByText('ignored')).toBeNull();
});

test('removes itself from the store after the exit animation', () => {
  const { id, refresh } = show({ type: 'default', title: 'x' });
  act(() => { dismissToast(id); });
  refresh();
  act(() => { jest.advanceTimersByTime(TOAST_EXIT_MS - 1); });
  expect(getToasts()).toHaveLength(1);
  act(() => { jest.advanceTimersByTime(1); });
  expect(getToasts()).toHaveLength(0);
});

test('reports its height on layout', () => {
  const onMeasure = jest.fn();
  const { id } = show({ type: 'default', title: 'x' }, { onMeasure });
  fireEvent(screen.getByTestId(`toast-${id}`), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 300, height: 72 } } });
  expect(onMeasure).toHaveBeenCalledWith(id, 72);
});

test('tapping the toast calls onTap', () => {
  const onTap = jest.fn();
  show({ type: 'default', title: 'x' }, { onTap });
  fireEvent.press(screen.getByText('x'));
  expect(onTap).toHaveBeenCalledTimes(1);
});

test('non-interactive layouts let touches pass through', () => {
  const { id } = show({ type: 'default', title: 'x' }, { layout: { ...layout, interactive: false } });
  expect(StyleSheet.flatten(screen.getByTestId(`toast-${id}`, { includeHiddenElements: true }).props.style)).toMatchObject({ pointerEvents: "none" });
});

test('unmounting with a live timer leaves no pending timers', () => {
  const { unmount } = show({ type: 'default', title: 'x' });
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});

test('screen readers get a Dismiss action that closes the toast', () => {
  const onDismiss = jest.fn();
  const { id } = show({ type: 'default', title: 'Stuck', duration: Infinity, onDismiss });
  const node = screen.getByTestId(`toast-${id}`);
  expect(node.props.accessibilityActions).toEqual([{ name: 'dismiss', label: 'Dismiss' }]);
  fireEvent(node, 'accessibilityAction', { nativeEvent: { actionName: 'dismiss' } });
  expect(getToasts()[0].dismissed).toBe(true);
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('a non-dismissible toast exposes no Dismiss action', () => {
  const { id } = show({ type: 'default', title: 'Pinned', dismissible: false });
  expect(screen.getByTestId(`toast-${id}`).props.accessibilityActions).toBeUndefined();
});
