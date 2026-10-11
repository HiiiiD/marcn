import {
  clamp,
  closestThumb,
  offsetFromRatio,
  ratioFromPosition,
  ratioFromValue,
  snapToStep,
  updateValue,
  valueFromRatio,
} from '@/registry/marcn/ui/slider/math';

test('clamp', () => {
  expect(clamp(5, 0, 3)).toBe(3);
  expect(clamp(-1, 0, 3)).toBe(0);
  expect(clamp(2, 0, 3)).toBe(2);
});

describe('snapToStep', () => {
  test('rounds to the grid and clamps', () => {
    expect(snapToStep(7, 0, 100, 5)).toBe(5);
    expect(snapToStep(8, 0, 100, 5)).toBe(10);
    expect(snapToStep(150, 0, 100, 5)).toBe(100);
    expect(snapToStep(-5, 0, 100, 5)).toBe(0);
  });
  test('anchors the grid at min', () => {
    expect(snapToStep(12, 1, 100, 5)).toBe(11);
  });
  test('fractional steps carry no float noise', () => {
    expect(snapToStep(0.3, 0, 1, 0.1)).toBe(0.3);
    expect(snapToStep(0.7000000001, 0, 1, 0.1)).toBe(0.7);
  });
  test('a max off the grid is still the upper bound', () => {
    expect(snapToStep(11, 0, 10, 3)).toBe(10);
  });
});

describe('ratioFromPosition', () => {
  const axis = { length: 216, thumbSize: 16 };
  test('maps the usable range to 0..1', () => {
    expect(ratioFromPosition({ ...axis, position: 8 })).toBe(0);
    expect(ratioFromPosition({ ...axis, position: 108 })).toBe(0.5);
    expect(ratioFromPosition({ ...axis, position: 208 })).toBe(1);
  });
  test('clamps outside the track', () => {
    expect(ratioFromPosition({ ...axis, position: -50 })).toBe(0);
    expect(ratioFromPosition({ ...axis, position: 999 })).toBe(1);
  });
  test('vertical and inverted flip the ratio', () => {
    expect(ratioFromPosition({ ...axis, position: 8, vertical: true })).toBe(1);
    expect(ratioFromPosition({ ...axis, position: 8, inverted: true })).toBe(1);
    expect(ratioFromPosition({ ...axis, position: 8, vertical: true, inverted: true })).toBe(0);
  });
  test('length not yet measured never yields NaN', () => {
    expect(ratioFromPosition({ length: 0, thumbSize: 16, position: 30 })).toBe(0);
    expect(ratioFromPosition({ length: 16, thumbSize: 16, position: 30 })).toBe(0);
  });
});

describe('offsetFromRatio', () => {
  const axis = { length: 216, thumbSize: 16 };
  test('is the inverse of ratioFromPosition', () => {
    expect(offsetFromRatio({ ...axis, ratio: 0.5 })).toBe(100);
    expect(offsetFromRatio({ ...axis, ratio: 0.25, vertical: true })).toBe(150);
    expect(offsetFromRatio({ ...axis, ratio: 0.25, inverted: true })).toBe(150);
    expect(offsetFromRatio({ ...axis, ratio: 0.25, vertical: true, inverted: true })).toBe(50);
  });
  test('zero length gives a zero offset, not NaN', () => {
    expect(offsetFromRatio({ length: 0, thumbSize: 16, ratio: 0.5 })).toBe(0);
  });
});

describe('ratioFromValue / valueFromRatio', () => {
  test('round trip', () => {
    expect(ratioFromValue(25, 0, 100)).toBe(0.25);
    expect(valueFromRatio(0.25, 0, 100, 1)).toBe(25);
  });
  test('min === max never yields NaN', () => {
    expect(ratioFromValue(5, 5, 5)).toBe(0);
  });
});

describe('closestThumb', () => {
  test('picks the nearest thumb', () => {
    expect(closestThumb([20, 80], 30)).toBe(0);
    expect(closestThumb([20, 80], 60)).toBe(1);
  });
  test('overlapping thumbs: dragging right takes the right thumb, left takes the left', () => {
    expect(closestThumb([50, 50], 70)).toBe(1);
    expect(closestThumb([50, 50], 30)).toBe(0);
    expect(closestThumb([0, 0], 10)).toBe(1);
  });
});

describe('updateValue', () => {
  const base = { min: 0, max: 100, step: 1, minStepsBetweenThumbs: 0 };
  test('thumbs cannot cross', () => {
    expect(updateValue({ ...base, values: [20, 80], index: 0, next: 90 })).toEqual([80, 80]);
    expect(updateValue({ ...base, values: [20, 80], index: 1, next: 10 })).toEqual([20, 20]);
  });
  test('minStepsBetweenThumbs keeps a gap', () => {
    expect(updateValue({ ...base, values: [20, 80], index: 0, next: 90, minStepsBetweenThumbs: 10 })).toEqual([70, 80]);
  });
  test('clamps to min and max', () => {
    expect(updateValue({ ...base, values: [20], index: 0, next: 150 })).toEqual([100]);
    expect(updateValue({ ...base, values: [20], index: 0, next: -5 })).toEqual([0]);
  });
  test('snaps to step', () => {
    expect(updateValue({ ...base, step: 10, values: [20], index: 0, next: 33 })).toEqual([30]);
  });
  test('returns the same array when nothing changes', () => {
    const values = [20, 80];
    expect(updateValue({ ...base, values, index: 0, next: 20.2 })).toBe(values);
  });
});

test('fractional step with minStepsBetweenThumbs carries no float noise', () => {
  expect(updateValue({ values: [0.2, 0.7], index: 0, next: 0.9, min: 0, max: 1, step: 0.1, minStepsBetweenThumbs: 3 })).toEqual([0.4, 0.7]);
});
