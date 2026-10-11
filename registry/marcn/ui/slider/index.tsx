import { useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { HIT, THUMB } from '@/registry/marcn/ui/slider/constants';
import { move, valueAt } from '@/registry/marcn/ui/slider/drag';
import { closestThumb, offsetFromRatio, ratioFromValue, tiedRange } from '@/registry/marcn/ui/slider/math';
import { createStyles } from '@/registry/marcn/ui/slider/styles';
import type { Live, SliderProps } from '@/registry/marcn/ui/slider/types';

export type { SliderProps, SliderState } from '@/registry/marcn/ui/slider/types';

export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  orientation = 'horizontal',
  inverted = false,
  disabled = false,
  render,
  style,
  onLayout,
  ...props
}: SliderProps) {
  const s = useStyles(createStyles);
  const [values, setValues] = useControllableState<number[]>({ value, defaultValue: defaultValue ?? [min], onChange: onValueChange });
  const [length, setLength] = useState(0);
  const vertical = orientation === 'vertical';

  const live = useRef<Live>({} as Live);
  const active = live.current.active ?? 0;
  Object.assign(live.current, { values, length, active, min, max, step, minSteps: minStepsBetweenThumbs, vertical, inverted, setValues, onCommit: onValueCommit });

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        // Let the parent ScrollView win the cross-axis swipe; taps still set the value in onBegin.
        .activeOffsetX(vertical ? [-999, 999] : [-5, 5])
        .activeOffsetY(vertical ? [-5, 5] : [-999, 999])
        .failOffsetY(vertical ? [-999, 999] : [-8, 8])
        .failOffsetX(vertical ? [-8, 8] : [-999, 999])
        .enabled(!disabled)
        .withTestId('slider')
        .onBegin((e) => {
          const l = live.current;
          const next = valueAt(l, e);
          l.active = closestThumb(l.values, next);
          const range = tiedRange(l.values, l.active);
          l.tie = range[0] === range[1] ? null : range;
          move(l, next);
        })
        .onUpdate((e) => move(live.current, valueAt(live.current, e)))
        .onFinalize(() => live.current.onCommit?.(live.current.values)),
    [disabled, vertical],
  );

  const nudge = (index: number, direction: 1 | -1) => {
    if (disabled) return;
    const l = live.current;
    l.active = index;
    l.tie = null;
    move(l, l.values[index] + direction * l.step);
    l.onCommit?.(l.values);
  };

  const axis = { length, thumbSize: THUMB, vertical, inverted };
  const ratios = values.map((v) => ratioFromValue(v, min, max));
  const edges = [values.length > 1 ? Math.min(...ratios) : 0, Math.max(...ratios)].map((ratio) => offsetFromRatio({ ...axis, ratio }) + THUMB / 2);
  const start = Math.min(...edges);
  const extent = Math.max(...edges) - start;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLength(vertical ? height : width);
    onLayout?.(e);
  };

  return (
    <GestureDetector gesture={gesture}>
      {renderElement(
        View,
        render,
        {
          ...props,
          onLayout: handleLayout,
          style: [vertical ? s.vertical : s.horizontal, disabled && s.disabled, style],
          children: (
            <>
              <View style={[s.track, vertical ? s.trackV : s.trackH]}>
                <View style={[s.range, vertical ? { top: start, height: extent, width: '100%' } : { left: start, width: extent, height: '100%' }]} />
              </View>
              {ratios.map((ratio, index) => {
                const offset = offsetFromRatio({ ...axis, ratio });
                return (
                  <View
                    key={index}
                    accessible
                    accessibilityRole="adjustable"
                    accessibilityState={{ disabled }}
                    accessibilityValue={{ min, max, now: values[index] }}
                    accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
                    onAccessibilityAction={(e) => nudge(index, e.nativeEvent.actionName === 'increment' ? 1 : -1)}
                    style={[s.thumb, vertical ? { top: offset, left: (HIT - THUMB) / 2 } : { left: offset, top: (HIT - THUMB) / 2 }]}
                  />
                );
              })}
            </>
          ),
        } as ViewProps,
        { values, disabled },
      )}
    </GestureDetector>
  );
}
