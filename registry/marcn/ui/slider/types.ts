import type { Ref } from 'react';
import type { View, ViewProps } from 'react-native';
import type { RenderProp } from '@/registry/marcn/lib/render';

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
export type Live = {
  values: number[];
  length: number;
  active: number;
  tie: [number, number] | null;
  min: number;
  max: number;
  step: number;
  minSteps: number;
  vertical: boolean;
  inverted: boolean;
  setValues: (values: number[]) => void;
  onCommit?: (values: number[]) => void;
};
