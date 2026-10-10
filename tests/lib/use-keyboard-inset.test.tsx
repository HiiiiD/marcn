import { Dimensions, Keyboard, Platform } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

test('Android: adds the system-bar inset RN leaves out of the reported height', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, left: 0, right: 0, bottom: 24 });
  const hook = renderHook(() => useKeyboardInset());
  act(() => handlers.keyboardDidShow({ endCoordinates: { screenY: 500, height: 280 } }));
  expect(hook.result.current.height).toBe(304);
  act(() => handlers.keyboardDidHide({}));
  expect(hook.result.current.height).toBe(0);
});

test('removes both listeners on unmount', () => {
  renderHook(() => useKeyboardInset()).unmount();
  expect(remove).toHaveBeenCalledTimes(2);
});

test('Android: an already-visible keyboard also gets the system-bar inset', () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, left: 0, right: 0, bottom: 24 });
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  jest.spyOn(Keyboard, 'metrics').mockReturnValue({ screenX: 0, screenY: 500, width: 400, height: 280 });
  expect(renderHook(() => useKeyboardInset()).result.current.height).toBe(304);
});

test('starts at the current height when the keyboard is already up', () => {
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  jest.spyOn(Keyboard, 'metrics').mockReturnValue({ screenX: 0, screenY: 500, width: 400, height: 300 });
  const hook = renderHook(() => useKeyboardInset());
  expect(hook.result.current.height).toBe(300);
  expect(hook.result.current.inset.value).toBe(300);
});
