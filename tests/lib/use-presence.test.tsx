import { act, renderHook } from '@testing-library/react-native';
import { OVERLAY_DURATION, usePresence, useProgress } from '@/registry/marcn/lib/use-presence';

afterEach(() => jest.useRealTimers());

test('stays present for the duration after close, then unmounts', () => {
  jest.useFakeTimers();
  const hook = renderHook(({ open }: { open: boolean }) => usePresence(open), { initialProps: { open: true } });
  expect(hook.result.current).toBe(true);
  hook.rerender({ open: false });
  expect(hook.result.current).toBe(true);
  act(() => { jest.advanceTimersByTime(OVERLAY_DURATION); });
  expect(hook.result.current).toBe(false);
});

test('closed from the start is not present; opening is immediate', () => {
  const hook = renderHook(({ open }: { open: boolean }) => usePresence(open), { initialProps: { open: false } });
  expect(hook.result.current).toBe(false);
  hook.rerender({ open: true });
  expect(hook.result.current).toBe(true);
});

test('reopening during the exit animation cancels the unmount', () => {
  jest.useFakeTimers();
  const hook = renderHook(({ open }: { open: boolean }) => usePresence(open), { initialProps: { open: true } });
  hook.rerender({ open: false });
  act(() => { jest.advanceTimersByTime(OVERLAY_DURATION / 2); });
  hook.rerender({ open: true });
  act(() => { jest.advanceTimersByTime(OVERLAY_DURATION * 2); });
  expect(hook.result.current).toBe(true);
});

test('useProgress follows open', () => {
  const hook = renderHook(({ open }: { open: boolean }) => useProgress(open), { initialProps: { open: true } });
  expect(hook.result.current.value).toBe(1);
  hook.rerender({ open: false });
  expect(hook.result.current.value).toBe(0);
});
