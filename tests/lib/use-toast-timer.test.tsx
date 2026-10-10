import { act, renderHook } from '@testing-library/react-native';
import { useToastTimer } from '@/registry/marcn/lib/use-toast-timer';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

type Props = { duration: number; paused: boolean; rev: number };
const setup = (initial: Props, onExpire = jest.fn()) => ({
  onExpire,
  ...renderHook((p: Props) => useToastTimer({ ...p, onExpire }), { initialProps: initial }),
});
const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });

test('expires once after the duration', () => {
  const { onExpire } = setup({ duration: 1000, paused: false, rev: 1 });
  advance(999);
  expect(onExpire).not.toHaveBeenCalled();
  advance(1);
  advance(5000);
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test('pausing keeps the remaining time instead of restarting', () => {
  const { onExpire, rerender } = setup({ duration: 1000, paused: false, rev: 1 });
  advance(600);
  rerender({ duration: 1000, paused: true, rev: 1 });
  advance(10000);
  expect(onExpire).not.toHaveBeenCalled();
  rerender({ duration: 1000, paused: false, rev: 1 });
  advance(399);
  expect(onExpire).not.toHaveBeenCalled();
  advance(1);
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test('a new rev restarts the full duration', () => {
  const { onExpire, rerender } = setup({ duration: 1000, paused: false, rev: 1 });
  advance(900);
  rerender({ duration: 1000, paused: false, rev: 2 });
  advance(900);
  expect(onExpire).not.toHaveBeenCalled();
  advance(100);
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test('Infinity never expires, and becoming finite starts counting', () => {
  const { onExpire, rerender } = setup({ duration: Infinity, paused: false, rev: 1 });
  advance(100000);
  expect(onExpire).not.toHaveBeenCalled();
  rerender({ duration: 500, paused: false, rev: 2 });
  advance(500);
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test('unmounting clears the timer', () => {
  const { onExpire, unmount } = setup({ duration: 1000, paused: false, rev: 1 });
  unmount();
  advance(2000);
  expect(onExpire).not.toHaveBeenCalled();
});
