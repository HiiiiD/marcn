import { bodyDrag, dragPosition, rubberBand, settle } from '@/registry/marcn/lib/sheet-snap';

test('rubberBand grows with distance but never reaches the limit', () => {
  expect(rubberBand(0)).toBe(0);
  expect(rubberBand(50)).toBeGreaterThan(0);
  expect(rubberBand(50)).toBeLessThan(rubberBand(200));
  expect(rubberBand(100000)).toBeLessThan(120);
});

test('dragPosition is linear toward dismissal and damped past the open position', () => {
  expect(dragPosition(300)).toBe(300);
  expect(dragPosition(-300)).toBeLessThan(0);
  expect(dragPosition(-300)).toBeGreaterThan(-120);
});

// hidden[i] = how far snap i sits below the largest one; sizes[0] is the smallest visible size.
const one = { hidden: [0], lowestSize: 600 };
const two = { hidden: [400, 0], lowestSize: 300 };

test('dismisses past 30% of the lowest size', () => {
  expect(settle({ ...one, position: 200, velocity: 0 })).toEqual({ dismiss: true });
  expect(settle({ ...one, position: 100, velocity: 0 })).toEqual({ index: 0 });
});

test('a fast downward flick dismisses from the lowest snap', () => {
  expect(settle({ ...one, position: 40, velocity: 1500 })).toEqual({ dismiss: true });
  expect(settle({ ...two, position: 410, velocity: 1500 })).toEqual({ dismiss: true });
});

test('a fast flick from a higher snap lands on the lower one instead of dismissing', () => {
  expect(settle({ ...two, position: 40, velocity: 1500 })).toEqual({ index: 0 });
});

test('picks the nearest snap, projecting the release velocity', () => {
  expect(settle({ ...two, position: 150, velocity: 0 })).toEqual({ index: 1 });
  expect(settle({ ...two, position: 250, velocity: 0 })).toEqual({ index: 0 });
  expect(settle({ ...two, position: 250, velocity: -800 })).toEqual({ index: 1 });
});

test('releasing while stretched past the top returns to the largest snap', () => {
  expect(settle({ ...two, position: -80, velocity: -500 })).toEqual({ index: 1 });
});

const body = { anchor: 0, scrolled: 0, startedAtTop: true, hasScroll: true };

test('a body drag without a list inside follows the finger freely', () => {
  expect(bodyDrag({ ...body, hasScroll: false, translation: -40 })).toEqual({ anchor: 0, drag: -40 });
});

test('a body drag leaves the gesture to a scrolled list and re-anchors', () => {
  expect(bodyDrag({ ...body, scrolled: 120, translation: 30 })).toEqual({ anchor: 30, drag: null });
});

test('once the list is back at its start a downward drag moves the sheet from where the list gave up', () => {
  expect(bodyDrag({ ...body, anchor: 30, translation: 90 })).toEqual({ anchor: 30, drag: 60 });
});

test('an upward drag at the top snap never stretches the sheet and re-anchors for the list', () => {
  expect(bodyDrag({ ...body, anchor: 20, translation: -10 })).toEqual({ anchor: -10, drag: 0 });
});

test('a drag that starts below the top snap moves the sheet both ways', () => {
  expect(bodyDrag({ ...body, startedAtTop: false, translation: -50 })).toEqual({ anchor: 0, drag: -50 });
});
