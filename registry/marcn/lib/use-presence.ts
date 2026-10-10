import { useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export const OVERLAY_DURATION = 200;

// Timer-driven like Collapsible, so unmount stays JS-only and testable.
export function usePresence(open: boolean, duration = OVERLAY_DURATION) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [open, duration]);
  return open || mounted;
}

export function useProgress(open: boolean, duration = OVERLAY_DURATION) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration });
  }, [open, duration, progress]);
  return progress;
}
