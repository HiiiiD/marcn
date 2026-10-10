import { Dimensions, Keyboard, Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useKeyboardInset } from '@/registry/marcn/lib/use-keyboard-inset';

const handlers: Record<string, (e: any) => void> = {};
const remove = jest.fn();

beforeEach(() => {
  remove.mockClear();
  jest.spyOn(Keyboard, 'addListener').mockImplementation(((event: string, cb: (e: any) => void) => {
    handlers[event] = cb;
    return { remove };
  }) as never);
  jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 400, height: 800, scale: 1, fontScale: 1 });
});
afterEach(() => jest.restoreAllMocks());

test('iOS: derives the inset from the frame and resets on hide', () => {
  const hook = renderHook(() => useKeyboardInset());
  act(() => handlers.keyboardWillChangeFrame({ endCoordinates: { screenY: 500, height: 300 } }));
  expect(hook.result.current.height).toBe(300);
  act(() => handlers.keyboardWillChangeFrame({ endCoordinates: { screenY: 800, height: 0 } }));
  expect(hook.result.current.height).toBe(0);
  act(() => handlers.keyboardWillChangeFrame({ endCoordinates: { screenY: 500, height: 300 } }));
  act(() => handlers.keyboardWillHide({}));
  expect(hook.result.current.height).toBe(0);
});

test('Android: uses the reported height', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const hook = renderHook(() => useKeyboardInset());
  act(() => handlers.keyboardDidShow({ endCoordinates: { screenY: 500, height: 280 } }));
  expect(hook.result.current.height).toBe(280);
  act(() => handlers.keyboardDidHide({}));
  expect(hook.result.current.height).toBe(0);
});

test('removes both listeners on unmount', () => {
  renderHook(() => useKeyboardInset()).unmount();
  expect(remove).toHaveBeenCalledTimes(2);
});

test('starts at the current height when the keyboard is already up', () => {
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  jest.spyOn(Keyboard, 'metrics').mockReturnValue({ screenX: 0, screenY: 500, width: 400, height: 300 });
  const hook = renderHook(() => useKeyboardInset());
  expect(hook.result.current.height).toBe(300);
  expect(hook.result.current.inset.value).toBe(300);
});
