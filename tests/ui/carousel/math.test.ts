import { itemOffsets, leadingIndex, nearestIndex, neighborOffset, snapPoints } from '@/registry/marcn/ui/carousel/math';

const starts = [0, 116, 232, 348];
const sizes = [100, 100, 100, 100];

test('start alignment uses item starts, clamped to the scrollable range', () => {
  expect(itemOffsets({ starts, sizes, viewport: 100, content: 448, align: 'start' })).toEqual([0, 116, 232, 348]);
  expect(itemOffsets({ starts, sizes, viewport: 200, content: 448, align: 'start' })).toEqual([0, 116, 232, 248]);
});

test('center alignment shifts by half the free space and clamps', () => {
  expect(itemOffsets({ starts, sizes, viewport: 200, content: 448, align: 'center' })).toEqual([0, 66, 182, 248]);
});

test('empty and unmeasured inputs return no offsets or zeros', () => {
  expect(itemOffsets({ starts: [], sizes: [], viewport: 0, content: 0, align: 'start' })).toEqual([]);
  expect(itemOffsets({ starts: [0, 50], sizes: [50, 50], viewport: 200, content: 100, align: 'start' })).toEqual([0, 0]);
});

test('snapPoints dedupes and sorts', () => {
  expect(snapPoints([0, 100, 248, 248, 248])).toEqual([0, 100, 248]);
  expect(snapPoints([])).toEqual([]);
});

test('nearestIndex picks the closest offset and prefers the current index on ties', () => {
  expect(nearestIndex([0, 116, 232], 110)).toBe(1);
  expect(nearestIndex([0, 116, 232], 232)).toBe(2);
  expect(nearestIndex([0, 100, 248, 248], 248)).toBe(2);
  expect(nearestIndex([0, 100, 248, 248], 248, 3)).toBe(3);
  expect(nearestIndex([], 10)).toBe(0);
});

test('leadingIndex is the first item that ends after the offset', () => {
  expect(leadingIndex(starts, sizes, 0)).toBe(0);
  expect(leadingIndex(starts, sizes, 110)).toBe(1);
  expect(leadingIndex(starts, sizes, 117)).toBe(1);
  expect(leadingIndex(starts, sizes, 217)).toBe(2);
  expect(leadingIndex(starts, sizes, 9999)).toBe(3);
  expect(leadingIndex([], [], 5)).toBe(0);
});

test('neighborOffset moves to the next/previous point and stops at the ends', () => {
  const points = [0, 116, 232, 248];
  expect(neighborOffset(points, 0, 1, 248)).toBe(116);
  expect(neighborOffset(points, 120, 1, 248)).toBe(232);
  expect(neighborOffset(points, 232, 1, 248)).toBe(248);
  expect(neighborOffset(points, 248, 1, 248)).toBeNull();
  expect(neighborOffset(points, 116, -1, 248)).toBe(0);
  expect(neighborOffset(points, 120, -1, 248)).toBe(116);
  expect(neighborOffset(points, 0, -1, 248)).toBeNull();
  expect(neighborOffset([], 0, 1, 0)).toBeNull();
});
