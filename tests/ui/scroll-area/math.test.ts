import { thumbMetrics } from '@/registry/marcn/ui/scroll-area/math';

test('hidden when content fits or sizes are unmeasured', () => {
  expect(thumbMetrics({ viewport: 200, content: 200, offset: 0, track: 198 }).visible).toBe(false);
  expect(thumbMetrics({ viewport: 0, content: 0, offset: 0, track: 0 }).visible).toBe(false);
  expect(thumbMetrics({ viewport: 200, content: 100, offset: 0, track: 198 }).visible).toBe(false);
});

test('thumb is proportional to the visible fraction', () => {
  const t = thumbMetrics({ viewport: 200, content: 400, offset: 0, track: 200 });
  expect(t).toEqual({ size: 100, position: 0, visible: true });
});

test('thumb moves linearly and reaches the end of the track', () => {
  expect(thumbMetrics({ viewport: 200, content: 400, offset: 100, track: 200 }).position).toBe(50);
  expect(thumbMetrics({ viewport: 200, content: 400, offset: 200, track: 200 }).position).toBe(100);
});

test('overscroll is clamped inside the track', () => {
  expect(thumbMetrics({ viewport: 200, content: 400, offset: -50, track: 200 }).position).toBe(0);
  expect(thumbMetrics({ viewport: 200, content: 400, offset: 999, track: 200 }).position).toBe(100);
});

test('minimum thumb size applies but never exceeds the track', () => {
  expect(thumbMetrics({ viewport: 100, content: 10000, offset: 0, track: 100 }).size).toBe(24);
  expect(thumbMetrics({ viewport: 20, content: 10000, offset: 0, track: 20 }).size).toBe(20);
});
