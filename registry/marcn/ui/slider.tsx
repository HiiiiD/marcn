import { useMemo, useRef, useState, type Ref } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import {
  closestThumb,
  offsetFromRatio,
  ratioFromPosition,
  ratioFromValue,
  updateValue,
  valueFromRatio,
} from '@/registry/marcn/lib/slider-math';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';

const THUMB = 16;
const HIT = 20;
const TRACK = 6;

const createStyles = (t: Theme) =>
  StyleSheet.create({
    horizontal: { height: HIT, justifyContent: 'center' },
    vertical: { width: HIT, alignItems: 'center' },
    track: { overflow: 'hidden', borderRadius: t.radius.full, backgroundColor: t.colors.muted },
    trackH: { height: TRACK, width: '100%' },
    trackV: { width: TRACK, height: '100%' },
    range: { position: 'absolute', backgroundColor: t.colors.primary },
    thumb: {
      position: 'absolute',
      width: THUMB,
      height: THUMB,
      borderRadius: t.radius.full,
      borderWidth: 1,
      borderColor: t.colors.primary,
      backgroundColor: t.colors.background,
    },
    disabled: { opacity: 0.5 },
  });

export type SliderState = { values: number[]; disabled: boolean };
export type SliderProps = Omit<ViewProps, 'children'> & {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  orientation?: 'horizontal' | 'vertical';
  inverted?: boolean;
  disabled?: boolean;
  render?: RenderProp<ViewProps, SliderState>;
  ref?: Ref<View>;
};

// Mutable snapshot of the latest props/state so the gesture can be created once and never re-attached mid-drag.
type Live = {
  values: number[];
  length: number;
  active: number;
  min: number;
  max: number;
  step: number;
  minSteps: number;
  vertical: boolean;
  inverted: boolean;
  setValues: (values: number[]) => void;
  onCommit?: (values: number[]) => void;
};

function valueAt(live: Live, e: { x: number; y: number }) {
  const ratio = ratioFromPosition({
    position: live.vertical ? e.y : e.x,
    length: live.length,
    thumbSize: THUMB,
    vertical: live.vertical,
    inverted: live.inverted,
  });
  return valueFromRatio(ratio, live.min, live.max, live.step);
}

function move(live: Live, next: number) {
  const values = updateValue({
    values: live.values,
    index: live.active,
    next,
    min: live.min,
    max: live.max,
    step: live.step,
    minStepsBetweenThumbs: live.minSteps,
  });
  if (values === live.values) return;
  live.values = values;
  live.setValues(values);
}

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
        .enabled(!disabled)
        .withTestId('slider')
        .onBegin((e) => {
          const l = live.current;
          const next = valueAt(l, e);
          l.active = closestThumb(l.values, next);
          move(l, next);
        })
        .onUpdate((e) => move(live.current, valueAt(live.current, e)))
        .onFinalize(() => live.current.onCommit?.(live.current.values)),
    [disabled],
  );

  const nudge = (index: number, direction: 1 | -1) => {
    if (disabled) return;
    const l = live.current;
    l.active = index;
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
