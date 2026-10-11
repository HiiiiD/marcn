import {
  addMonths,
  getMonthWeeks,
  getWeekdays,
  inRange,
  isMatch,
  nextRange,
  toggleDate,
  toggleDates,
} from '@/registry/marcn/ui/calendar/math';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('getMonthWeeks', () => {
  test('pads with outside days, Sunday start', () => {
    const weeks = getMonthWeeks(d(2024, 2, 10), 0);
    expect(weeks).toHaveLength(5);
    expect(weeks[0][0]).toEqual(d(2024, 1, 28));
    expect(weeks[0][4]).toEqual(d(2024, 2, 1));
    expect(weeks[4][6]).toEqual(d(2024, 3, 2));
  });
  test('monday start shifts the grid', () => {
    expect(getMonthWeeks(d(2024, 2, 1), 1)[0][0]).toEqual(d(2024, 1, 29));
  });
  test('exact 4 weeks, and fixedWeeks forces 6', () => {
    expect(getMonthWeeks(d(2026, 2, 1), 0)).toHaveLength(4);
    expect(getMonthWeeks(d(2026, 2, 1), 0, true)).toHaveLength(6);
  });
  test('survives DST boundaries', () => {
    const days = getMonthWeeks(d(2024, 3, 1), 0).flat();
    days.forEach((day, i) => i && expect(day.getDate()).not.toBe(days[i - 1].getDate()));
    expect(days.every((day) => day.getHours() === 0)).toBe(true);
  });
});

test('getWeekdays starts at weekStartsOn', () => {
  expect(getWeekdays(1).map((x) => x.getDay())).toEqual([1, 2, 3, 4, 5, 6, 0]);
});

test('addMonths rolls year and lands on day 1', () => {
  expect(addMonths(d(2024, 12, 31), 1)).toEqual(d(2025, 1, 1));
  expect(addMonths(d(2024, 1, 31), -1)).toEqual(d(2023, 12, 1));
});

describe('isMatch', () => {
  const day = d(2024, 5, 15);
  test('each matcher form', () => {
    expect(isMatch(day, day)).toBe(true);
    expect(isMatch(day, [d(2024, 5, 1), d(2024, 5, 15)])).toBe(true);
    expect(isMatch(day, { before: d(2024, 5, 16) })).toBe(true);
    expect(isMatch(day, { before: day })).toBe(false);
    expect(isMatch(day, { after: d(2024, 5, 14) })).toBe(true);
    expect(isMatch(day, { from: d(2024, 5, 15), to: d(2024, 5, 20) })).toBe(true);
    expect(isMatch(day, { dayOfWeek: [3] })).toBe(true);
    expect(isMatch(day, (x) => x.getDate() === 15)).toBe(true);
    expect(isMatch(day, true)).toBe(true);
    expect(isMatch(day, undefined)).toBe(false);
  });
  test('array of matchers', () => {
    expect(isMatch(day, [{ before: d(2024, 1, 1) }, { dayOfWeek: [3] }])).toBe(true);
    expect(isMatch(day, [{ before: d(2024, 1, 1) }, { dayOfWeek: [1] }])).toBe(false);
  });
  test('ignores time of day', () => {
    expect(isMatch(new Date(2024, 4, 15, 23, 59), { before: d(2024, 5, 16) })).toBe(true);
  });
});

test('toggleDate selects, deselects, honors required', () => {
  expect(toggleDate(undefined, d(2024, 1, 1))).toEqual(d(2024, 1, 1));
  expect(toggleDate(d(2024, 1, 1), d(2024, 1, 1))).toBeUndefined();
  expect(toggleDate(d(2024, 1, 1), d(2024, 1, 1), true)).toEqual(d(2024, 1, 1));
});

test('toggleDates adds, removes, respects min/max', () => {
  const a = d(2024, 1, 1);
  const b = d(2024, 1, 2);
  expect(toggleDates(undefined, a)).toEqual([a]);
  expect(toggleDates([a], b)).toEqual([a, b]);
  expect(toggleDates([a, b], a)).toEqual([b]);
  expect(toggleDates([a], a, 1)).toEqual([a]);
  expect(toggleDates([a], b, 0, 1)).toEqual([a]);
});

describe('nextRange', () => {
  const a = d(2024, 1, 10);
  test('start, complete, restart', () => {
    const r1 = nextRange(undefined, a);
    expect(r1).toEqual({ from: a });
    const r2 = nextRange(r1, d(2024, 1, 15));
    expect(r2).toEqual({ from: a, to: d(2024, 1, 15) });
    expect(nextRange(r2, d(2024, 1, 20))).toEqual({ from: d(2024, 1, 20) });
  });
  test('earlier second click swaps', () => {
    expect(nextRange({ from: a }, d(2024, 1, 5))).toEqual({ from: d(2024, 1, 5), to: a });
  });
  test('inRange is inclusive', () => {
    const r = { from: a, to: d(2024, 1, 12) };
    expect(inRange(d(2024, 1, 10), r)).toBe(true);
    expect(inRange(d(2024, 1, 12), r)).toBe(true);
    expect(inRange(d(2024, 1, 13), r)).toBe(false);
    expect(inRange(a, { from: a })).toBe(false);
  });
});
