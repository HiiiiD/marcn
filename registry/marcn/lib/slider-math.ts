export const clamp = (value: number, lo: number, hi: number) => Math.min(Math.max(value, lo), hi);

const decimals = (n: number) => {
  const text = String(n);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
};

export function snapToStep(value: number, min: number, max: number, step: number) {
  const snapped = Math.round((value - min) / step) * step + min;
  return clamp(Number(snapped.toFixed(Math.max(decimals(step), decimals(min)))), min, max);
}

export type Axis = { length: number; thumbSize: number; vertical?: boolean; inverted?: boolean };

export function ratioFromPosition({ position, length, thumbSize, vertical, inverted }: Axis & { position: number }) {
  const usable = length - thumbSize;
  if (usable <= 0) return 0;
  let ratio = clamp((position - thumbSize / 2) / usable, 0, 1);
  if (vertical) ratio = 1 - ratio;
  return inverted ? 1 - ratio : ratio;
}

export function offsetFromRatio({ ratio, length, thumbSize, vertical, inverted }: Axis & { ratio: number }) {
  const usable = Math.max(length - thumbSize, 0);
  let r = inverted ? 1 - ratio : ratio;
  if (vertical) r = 1 - r;
  return r * usable;
}

export const ratioFromValue = (value: number, min: number, max: number) => (max === min ? 0 : (value - min) / (max - min));

export const valueFromRatio = (ratio: number, min: number, max: number, step: number) => snapToStep(min + ratio * (max - min), min, max, step);

export function closestThumb(values: number[], value: number) {
  let best = 0;
  let last = 0;
  values.forEach((v, i) => {
    const d = Math.abs(v - value);
    const bestD = Math.abs(values[best] - value);
    if (d < bestD) {
      best = i;
      last = i;
    } else if (d === bestD) last = i;
  });
  return value > values[best] ? last : best;
}

// Lowest and highest index sharing the value of `index`; a stack of thumbs is resolved once the drag direction is known.
export function tiedRange(values: number[], index: number): [number, number] {
  const tied = values.map((v, i) => (v === values[index] ? i : -1)).filter((i) => i >= 0);
  return [tied[0], tied[tied.length - 1]];
}

type UpdateArgs = { values: number[]; index: number; next: number; min: number; max: number; step: number; minStepsBetweenThumbs: number };

export function updateValue({ values, index, next, min, max, step, minStepsBetweenThumbs }: UpdateArgs) {
  const gap = minStepsBetweenThumbs * step;
  const places = Math.max(decimals(step), decimals(min));
  const lo = index > 0 ? Number((values[index - 1] + gap).toFixed(places)) : min;
  const hi = index < values.length - 1 ? Number((values[index + 1] - gap).toFixed(places)) : max;
  const value = clamp(snapToStep(next, min, max, step), lo, hi);
  if (value === values[index]) return values;
  const out = values.slice();
  out[index] = value;
  return out;
}
