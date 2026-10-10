export type DateRange = { from?: Date; to?: Date };
export type Matcher =
  | boolean
  | Date
  | Date[]
  | { before: Date }
  | { after: Date }
  | { from: Date; to: Date }
  | { dayOfWeek: number[] }
  | ((date: Date) => boolean);

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const time = (d: Date) => startOfDay(d).getTime();

function matchOne(date: Date, matcher: Matcher): boolean {
  if (typeof matcher === 'boolean') return matcher;
  if (typeof matcher === 'function') return matcher(date);
  if (matcher instanceof Date) return isSameDay(date, matcher);
  if (Array.isArray(matcher)) return matcher.some((m) => isSameDay(date, m));
  if ('dayOfWeek' in matcher) return matcher.dayOfWeek.includes(date.getDay());
  if ('before' in matcher) return time(date) < time(matcher.before);
  if ('after' in matcher) return time(date) > time(matcher.after);
  return time(date) >= time(matcher.from) && time(date) <= time(matcher.to);
}

export function isMatch(date: Date, matcher?: Matcher | Matcher[]) {
  if (matcher === undefined) return false;
  if (Array.isArray(matcher) && matcher.some((m) => !(m instanceof Date))) {
    return (matcher as Matcher[]).some((m) => matchOne(date, m));
  }
  return matchOne(date, matcher as Matcher);
}

export function getMonthWeeks(month: Date, weekStartsOn: number, fixedWeeks = false) {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weekCount = fixedWeeks ? 6 : Math.ceil((lead + daysInMonth) / 7);
  return Array.from({ length: weekCount }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d - lead)),
  );
}

export const getWeekdays = (weekStartsOn: number) =>
  // 2023-01-01 is a Sunday.
  Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + ((weekStartsOn + i) % 7)));

export function toggleDate(selected: Date | undefined, date: Date, required = false) {
  if (selected && isSameDay(selected, date)) return required ? selected : undefined;
  return date;
}

export function toggleDates(selected: Date[] | undefined, date: Date, min = 0, max?: number) {
  const list = selected ?? [];
  if (list.some((d) => isSameDay(d, date))) {
    return list.length <= min ? list : list.filter((d) => !isSameDay(d, date));
  }
  return max !== undefined && list.length >= max ? list : [...list, date];
}

export function nextRange(range: DateRange | undefined, date: Date): DateRange | undefined {
  const { from, to } = range ?? {};
  if (!from || to) return { from: date };
  if (time(date) < time(from)) return { from: date, to: from };
  return { from, to: date };
}

export const inRange = (date: Date, range?: DateRange) =>
  !!range?.from && !!range.to && time(date) >= time(range.from) && time(date) <= time(range.to);
