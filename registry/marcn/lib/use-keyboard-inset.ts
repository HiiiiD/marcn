import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

// A keyboard already up when the overlay opens (focused field underneath) fires no event, so read it.
const currentHeight = () => (Keyboard.isVisible() ? Keyboard.metrics()?.height ?? 0 : 0);

export function useKeyboardInset() {
  const [height, setHeight] = useState(currentHeight);
  const inset = useSharedValue(height);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const update = (next: number) => {
      setHeight(next);
      inset.value = withTiming(next, { duration: 200 });
    };
    const change = Keyboard.addListener(ios ? 'keyboardWillChangeFrame' : 'keyboardDidShow', (e: KeyboardEvent) =>
      update(ios ? Math.max(0, Dimensions.get('window').height - e.endCoordinates.screenY) : e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => update(0));
    return () => {
      change.remove();
      hide.remove();
    };
  }, [inset]);

  return { height, inset };
}
