import { getMonthWeeks } from '@/registry/marcn/ui/calendar/math';
import { hitTest, type RowsLayout } from '@/registry/marcn/ui/calendar/range-drag';

const month = new Date(2024, 4, 1);
const layout = (top: number, hideOutside = false, m = month): RowsLayout => ({ top, weeks: getMonthWeeks(m, 0), month: m, hideOutside });

test('maps x/y to the day under the finger', () => {
  const rows = [layout(50)];
  expect(hitTest(rows, 700, 50, 60)).toEqual(new Date(2024, 3, 28));
  expect(hitTest(rows, 700, 450, 60)).toEqual(new Date(2024, 4, 2));
  expect(hitTest(rows, 700, 650, 50 + 36 * 2 + 1)).toEqual(new Date(2024, 4, 18));
});

test('misses outside every rows block and clamps columns', () => {
  const rows = [layout(50)];
  expect(hitTest(rows, 700, 10, 49)).toBeUndefined();
  expect(hitTest(rows, 700, 10, 50 + 36 * 5)).toBeUndefined();
  expect(hitTest(rows, 700, 9999, 60)).toEqual(new Date(2024, 4, 4));
  expect(hitTest(rows, 700, -50, 60)).toEqual(new Date(2024, 3, 28));
  expect(hitTest(rows, 0, 10, 60)).toBeUndefined();
});

test('hidden outside days are not hit', () => {
  expect(hitTest([layout(0, true)], 700, 50, 10)).toBeUndefined();
  expect(hitTest([layout(0, true)], 700, 450, 10)).toEqual(new Date(2024, 4, 2));
});

test('finds the right month block when stacked', () => {
  const june = new Date(2024, 5, 1);
  const rows = [layout(0), layout(300, true, june)];
  expect(hitTest(rows, 700, 650, 305)).toEqual(new Date(2024, 5, 1));
});
