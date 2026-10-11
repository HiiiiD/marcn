import { clampMonth, isMonthOutOfBounds, sortRange, yearPageStart } from '@/registry/marcn/ui/calendar/math';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

test('isMonthOutOfBounds compares by month', () => {
  const start = d(2024, 3, 15);
  const end = d(2024, 6, 2);
  expect(isMonthOutOfBounds(d(2024, 3, 1), start, end)).toBe(false);
  expect(isMonthOutOfBounds(d(2024, 2, 28), start, end)).toBe(true);
  expect(isMonthOutOfBounds(d(2024, 6, 30), start, end)).toBe(false);
  expect(isMonthOutOfBounds(d(2024, 7, 1), start, end)).toBe(true);
  expect(isMonthOutOfBounds(d(1999, 1, 1))).toBe(false);
});

test('clampMonth pulls into range', () => {
  expect(clampMonth(d(2020, 1, 1), d(2024, 3, 15), d(2024, 6, 1))).toEqual(d(2024, 3, 1));
  expect(clampMonth(d(2030, 1, 1), d(2024, 3, 15), d(2024, 6, 20))).toEqual(d(2024, 6, 1));
  const inside = d(2024, 4, 1);
  expect(clampMonth(inside, d(2024, 3, 1), d(2024, 6, 1))).toBe(inside);
});

test('sortRange orders ends', () => {
  expect(sortRange(d(2024, 1, 9), d(2024, 1, 3))).toEqual({ from: d(2024, 1, 3), to: d(2024, 1, 9) });
  expect(sortRange(d(2024, 1, 3), d(2024, 1, 9))).toEqual({ from: d(2024, 1, 3), to: d(2024, 1, 9) });
});

test('yearPageStart pages by 12', () => {
  expect(yearPageStart(2026)).toBe(2016);
  expect(yearPageStart(2028)).toBe(2028);
  expect(yearPageStart(2027)).toBe(2016);
});
