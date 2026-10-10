import { BackHandler } from 'react-native';
import { renderHook } from '@testing-library/react-native';
import { useBackDismiss } from '@/registry/marcn/lib/back-stack';
import { mockBackHandler } from '../back-handler';

afterEach(() => jest.restoreAllMocks());

test('only the topmost active entry is dismissed and the press is consumed', () => {
  const back = mockBackHandler();
  const first = jest.fn();
  const second = jest.fn();
  renderHook(() => useBackDismiss(true, first));
  const top = renderHook(() => useBackDismiss(true, second));
  expect(back.press()).toBe(true);
  expect(second).toHaveBeenCalledTimes(1);
  expect(first).not.toHaveBeenCalled();
  top.unmount();
  expect(back.press()).toBe(true);
  expect(first).toHaveBeenCalledTimes(1);
});

test('inactive entries are ignored and the subscription is released when the stack empties', () => {
  const back = mockBackHandler();
  const cb = jest.fn();
  const inactive = renderHook(() => useBackDismiss(false, cb));
  expect(BackHandler.addEventListener).not.toHaveBeenCalled();
  const active = renderHook(() => useBackDismiss(true, cb));
  expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
  active.unmount();
  expect(back.remove).toHaveBeenCalledTimes(1);
  inactive.unmount();
});

test('uses the latest callback without re-registering', () => {
  const back = mockBackHandler();
  const a = jest.fn();
  const b = jest.fn();
  const hook = renderHook(({ cb }: { cb: () => void }) => useBackDismiss(true, cb), { initialProps: { cb: a } });
  hook.rerender({ cb: b });
  back.press();
  expect(b).toHaveBeenCalledTimes(1);
  expect(a).not.toHaveBeenCalled();
  expect(BackHandler.addEventListener).toHaveBeenCalledTimes(1);
});

test('unmounting while active releases the handler (screen navigated away)', () => {
  const back = mockBackHandler();
  const hook = renderHook(() => useBackDismiss(true, jest.fn()));
  hook.unmount();
  expect(back.remove).toHaveBeenCalledTimes(1);
});
