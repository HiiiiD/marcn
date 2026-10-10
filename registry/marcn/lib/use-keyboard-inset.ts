import { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Android reports the IME height minus the system bars, but overlays fill the window edge to edge.
const androidCover = (height: number, bottomInset: number) => (height > 0 ? height + bottomInset : 0);

export function useKeyboardInset() {
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'android' ? insets.bottom : 0;
  // A keyboard already up when the overlay opens (focused field underneath) fires no event, so read it.
  const [height, setHeight] = useState(() =>
    Keyboard.isVisible() ? androidCover(Keyboard.metrics()?.height ?? 0, bottomInset) : 0,
  );
  const inset = useSharedValue(height);
  const bottomRef = useRef(bottomInset);
  bottomRef.current = bottomInset;

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const update = (next: number) => {
      setHeight(next);
      inset.value = withTiming(next, { duration: 200 });
    };
    const change = Keyboard.addListener(ios ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (e: KeyboardEvent) =>
      update(
        ios
          ? Math.max(0, Dimensions.get('window').height - e.endCoordinates.screenY)
          : androidCover(e.endCoordinates.height, bottomRef.current),
      ),
    );
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => update(0));
    return () => {
      change.remove();
      hide.remove();
    };
  }, [inset]);

  return { height, inset };
}
