const load = (dims: { width: number; height: number }, os: 'ios' | 'android') => {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    Dimensions: { get: () => dims },
    PixelRatio: { roundToNearestPixel: (n: number) => Math.round(n) },
    Platform: { OS: os },
  }));
  return require('@/registry/marcn/lib/scale') as typeof import('@/registry/marcn/lib/scale');
};

test('scale is relative to the 390 frame', () => {
  const { scale } = load({ width: 780, height: 1600 }, 'ios');
  expect(scale(10)).toBeCloseTo((430 / 390) * 10);
});

test('uses the shortest side so rotation is stable', () => {
  const portrait = load({ width: 390, height: 800 }, 'ios').scale(10);
  const landscape = load({ width: 800, height: 390 }, 'ios').scale(10);
  expect(landscape).toBe(portrait);
  expect(portrait).toBeCloseTo(10);
});

test('moderateScale damps the delta by factor', () => {
  const { scale, moderateScale } = load({ width: 430, height: 900 }, 'ios');
  expect(moderateScale(20, 0)).toBe(20);
  expect(moderateScale(20, 1)).toBeCloseTo(scale(20));
  expect(moderateScale(20)).toBeCloseTo(20 + (scale(20) - 20) / 2);
});

test('font nudges by platform', () => {
  expect(load({ width: 390, height: 800 }, 'ios').font(16)).toBe(16.5);
  expect(load({ width: 390, height: 800 }, 'android').font(16)).toBe(15.5);
});
