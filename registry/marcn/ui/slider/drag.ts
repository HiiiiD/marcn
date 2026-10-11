import { THUMB } from '@/registry/marcn/ui/slider/constants';
import { ratioFromPosition, updateValue, valueFromRatio } from '@/registry/marcn/ui/slider/math';
import type { Live } from '@/registry/marcn/ui/slider/types';

export function valueAt(live: Live, e: { x: number; y: number }) {
  const ratio = ratioFromPosition({
    position: live.vertical ? e.y : e.x,
    length: live.length,
    thumbSize: THUMB,
    vertical: live.vertical,
    inverted: live.inverted,
  });
  return valueFromRatio(ratio, live.min, live.max, live.step);
}

export function move(live: Live, next: number) {
  if (live.tie && next !== live.values[live.active]) {
    live.active = next > live.values[live.active] ? live.tie[1] : live.tie[0];
    live.tie = null;
  }
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
