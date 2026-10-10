import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { stackLayout, type ToastPosition } from '@/registry/marcn/lib/toast-stack';
import type { ToastData, ToastId } from '@/registry/marcn/lib/toast-store';
import { ToastView } from '@/registry/marcn/lib/toast-view';

const IDLE_COLLAPSE_MS = 5000;
const EDGE_MARGIN = 8;

// Full-size wrapper: Android does not deliver touches to children outside their parent's bounds.
const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'box-none' },
  box: { position: 'absolute', left: 16, right: 16, pointerEvents: 'box-none' },
});

export type ToastLayerProps = {
  toasts: readonly ToastData[];
  position: ToastPosition;
  visibleToasts: number;
  duration: number;
};

export function ToastLayer({ toasts, position, visibleToasts, duration }: ToastLayerProps) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [touching, setTouching] = useState<readonly ToastId[]>([]);
  const [heights, setHeights] = useState<Record<string, number>>({});

  const live = useMemo(() => toasts.filter((t) => !t.dismissed).reverse(), [toasts]);
  const liveCount = live.length;

  useEffect(() => {
    if (liveCount <= 1) setExpanded(false);
  }, [liveCount]);

  // An expanded stack pauses every timer, so it must not stay expanded forever.
  useEffect(() => {
    if (!expanded || touching.length > 0) return;
    const timer = setTimeout(() => setExpanded(false), IDLE_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [expanded, touching]);

  const onMeasure = useCallback((id: ToastId, height: number) => {
    setHeights((prev) => (prev[String(id)] === height ? prev : { ...prev, [String(id)]: height }));
  }, []);
  const onTouch = useCallback((id: ToastId, on: boolean) => {
    setTouching((prev) => {
      if (prev.includes(id) === on) return prev;
      return on ? [...prev, id] : prev.filter((i) => i !== id);
    });
  }, []);
  const onTap = useCallback(() => setExpanded((e) => liveCount > 1 && !e), [liveCount]);

  const measured = live.map((t) => heights[String(t.id)]);
  const edge = (position === 'top' ? insets.top : insets.bottom) + EDGE_MARGIN;

  return (
    <View style={styles.fill}>
      <View style={[styles.box, { [position]: edge }]}>
        {toasts.map((t) => (
          <ToastView
            key={t.id}
            toast={t}
            layout={stackLayout({ index: Math.max(live.indexOf(t), 0), expanded, heights: measured, visible: visibleToasts, position })}
            position={position}
            duration={duration}
            paused={expanded || touching.length > 0}
            onMeasure={onMeasure}
            onTouch={onTouch}
            onTap={onTap}
          />
        ))}
      </View>
    </View>
  );
}
