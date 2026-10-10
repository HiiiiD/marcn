import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

type Entry = { dismiss: () => void };

const stack: Entry[] = [];
let subscription: { remove: () => void } | null = null;

function subscribe() {
  if (subscription) return;
  subscription = BackHandler.addEventListener('hardwareBackPress', () => {
    const top = stack[stack.length - 1];
    if (!top) return false;
    top.dismiss();
    return true;
  });
}

export function useBackDismiss(active: boolean, onDismiss: () => void) {
  const latest = useRef(onDismiss);
  latest.current = onDismiss;

  useEffect(() => {
    if (!active) return;
    const entry: Entry = { dismiss: () => latest.current() };
    stack.push(entry);
    subscribe();
    return () => {
      stack.splice(stack.indexOf(entry), 1);
      if (stack.length === 0) {
        subscription?.remove();
        subscription = null;
      }
    };
  }, [active]);
}
