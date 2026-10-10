import { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export function useKeyboardInset() {
  const inset = useSharedValue(0);
  const [height, setHeight] = useState(0);

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
