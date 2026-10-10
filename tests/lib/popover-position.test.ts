import { computePosition, type PositionOptions } from '@/registry/marcn/lib/popover-position';

const window = { width: 400, height: 800 };
const content = { width: 80, height: 50 };
const anchor = { x: 100, y: 100, width: 100, height: 40 };
const base: PositionOptions = { side: 'bottom', align: 'center', sideOffset: 4, alignOffset: 0, avoidCollisions: true, collisionPadding: 8 };

test('places below, centered', () => {
  expect(computePosition(anchor, content, window, base)).toEqual({ x: 110, y: 144, side: 'bottom' });
});

test('places on each side', () => {
  expect(computePosition(anchor, content, window, { ...base, side: 'top' })).toEqual({ x: 110, y: 46, side: 'top' });
  expect(computePosition(anchor, content, window, { ...base, side: 'right' })).toEqual({ x: 204, y: 95, side: 'right' });
  expect(computePosition(anchor, content, window, { ...base, side: 'left' })).toEqual({ x: 16, y: 95, side: 'left' });
});

test('aligns start and end and applies alignOffset', () => {
  expect(computePosition(anchor, content, window, { ...base, align: 'start' }).x).toBe(100);
  expect(computePosition(anchor, content, window, { ...base, align: 'end' }).x).toBe(120);
  expect(computePosition(anchor, content, window, { ...base, alignOffset: 10 }).x).toBe(120);
});

test('flips to the opposite side when the preferred side overflows and the other fits', () => {
  const low = { x: 100, y: 740, width: 100, height: 40 };
  expect(computePosition(low, content, window, base)).toEqual({ x: 110, y: 686, side: 'top' });
});

test('keeps the preferred side when both overflow, then clamps into the window', () => {
  const tall = { width: 80, height: 700 };
  const mid = { x: 100, y: 300, width: 100, height: 40 };
  expect(computePosition(mid, tall, window, base)).toEqual({ x: 110, y: 92, side: 'bottom' });
});

test('clamps horizontally to the collision padding', () => {
  expect(computePosition({ x: 360, y: 100, width: 30, height: 40 }, content, window, base).x).toBe(312);
  expect(computePosition({ x: 0, y: 100, width: 20, height: 40 }, content, window, base).x).toBe(8);
});

test('avoidCollisions false neither flips nor clamps', () => {
  const low = { x: 100, y: 740, width: 100, height: 40 };
  expect(computePosition(low, content, window, { ...base, avoidCollisions: false })).toEqual({ x: 110, y: 784, side: 'bottom' });
});

test('zero-size anchor and content still produce finite numbers', () => {
  const r = computePosition({ x: 0, y: 0, width: 0, height: 0 }, { width: 0, height: 0 }, window, base);
  expect(Number.isFinite(r.x) && Number.isFinite(r.y)).toBe(true);
});
