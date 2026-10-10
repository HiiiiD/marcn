import { useRef, useState, type Ref } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  addMonths,
  clampMonth,
  getWeekdays,
  inRange,
  isMatch,
  isMonthOutOfBounds,
  isSameDay,
  monthIndex,
  nextRange,
  sortRange,
  startOfMonth,
  toggleDate,
  toggleDates,
  YEARS_PER_PAGE,
  yearPageStart,
  type DateRange,
  type Matcher,
} from '@/registry/marcn/lib/calendar-math';
import { MonthGrid, type DayState } from '@/registry/marcn/lib/calendar-month';
import { CalendarHeader, MonthPicker, YearPicker } from '@/registry/marcn/lib/calendar-picker';
import { useRangeDrag } from '@/registry/marcn/lib/calendar-range-drag';
import { createCalendarStyles } from '@/registry/marcn/lib/calendar-styles';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';

export type { DateRange, Matcher };

type Selection<T> = { selected?: T; defaultSelected?: T; onSelect?: (selected: T | undefined) => void };
type ModeProps =
  | ({ mode?: 'single'; required?: boolean } & Selection<Date>)
  | ({ mode: 'multiple'; min?: number; max?: number } & Selection<Date[]>)
  | ({ mode: 'range' } & Selection<DateRange>);

export type CalendarProps = ModeProps & {
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  startMonth?: Date;
  endMonth?: Date;
  numberOfMonths?: number;
  captionLayout?: 'label' | 'dropdown';
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  disabled?: Matcher | Matcher[];
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<View>;
};

type View_ = 'days' | 'months' | 'years';

const asArray = (value: unknown): Date[] => (Array.isArray(value) ? value : value instanceof Date ? [value] : []);

export function Calendar(props: CalendarProps) {
  const { month, defaultMonth, onMonthChange, startMonth, endMonth, captionLayout = 'label', weekStartsOn = 0, locale, disabled, fixedWeeks, style, ref } = props;
  const s = useStyles(createCalendarStyles);
  const mode = props.mode ?? 'single';
  const count = Math.max(1, Math.floor(props.numberOfMonths ?? 1));
  const hideOutside = count > 1 || props.showOutsideDays === false;

  const [selected, setSelected] = useControllableState<unknown>({
    value: props.selected,
    defaultValue: props.defaultSelected,
    onChange: props.onSelect as ((value: unknown) => void) | undefined,
  });
  const range = mode === 'range' ? (selected as DateRange | undefined) : undefined;
  const initial = defaultMonth ?? asArray(range ? range.from : selected)[0] ?? new Date();
  const [visible, setVisible] = useControllableState<Date>({
    value: month && startOfMonth(month),
    defaultValue: clampMonth(startOfMonth(initial), startMonth, endMonth),
    onChange: onMonthChange,
  });
  const [view, setView] = useState<View_>('days');
  const [pickYear, setPickYear] = useState(visible.getFullYear());
  const [yearBase, setYearBase] = useState(yearPageStart(visible.getFullYear()));
  const [hover, setHover] = useState<Date>();

  const today = new Date();
  const goTo = (date: Date) => {
    const next = startOfMonth(date);
    if (monthIndex(next) !== monthIndex(visible)) setVisible(next);
  };
  const out = (date: Date) => isMonthOutOfBounds(date, startMonth, endMonth);

  const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options);
  const caption = fmt({ month: 'long', year: 'numeric' });
  const dayLabel = fmt({ dateStyle: 'full' });
  const weekdayName = fmt({ weekday: 'short' });
  const weekdayLabels = getWeekdays(weekStartsOn).map((d) => weekdayName.format(d));

  const shown: DateRange | undefined = range?.from && !range.to && hover ? sortRange(range.from, hover) : range;
  const isDisabled = (date: Date) => isMatch(date, disabled) || out(date);

  const select = (date: Date) => {
    setHover(undefined);
    if (mode === 'multiple') {
      const { min, max } = props as { min?: number; max?: number };
      setSelected(toggleDates(selected as Date[] | undefined, date, min, max));
    } else if (mode === 'range') {
      setSelected(nextRange(range, date));
    } else {
      setSelected(toggleDate(selected as Date | undefined, date, (props as { required?: boolean }).required));
    }
  };

  const getState = (date: Date): DayState => {
    if (shown) {
      if ((shown.from && isSameDay(shown.from, date)) || (shown.to && isSameDay(shown.to, date))) return 'selected';
      return inRange(date, shown) ? 'middle' : undefined;
    }
    return asArray(selected).some((d) => isSameDay(d, date)) ? 'selected' : undefined;
  };

  const bodyRef = useRef<View>(null);
  const drag = useRangeDrag(bodyRef, { enabled: !!range?.from && !range.to, isDisabled, onHover: setHover, onCommit: select });

  const header = {
    days: (
      <CalendarHeader
        label={caption.format(visible)}
        onLabelPress={
          captionLayout === 'dropdown'
            ? () => {
                setPickYear(visible.getFullYear());
                setView('months');
              }
            : undefined
        }
        labelAccessibility="Choose month and year"
        onPrev={() => setVisible(addMonths(visible, -1))}
        onNext={() => setVisible(addMonths(visible, 1))}
        prevDisabled={out(addMonths(visible, -1))}
        nextDisabled={out(addMonths(visible, count))}
        prevLabel="Previous month"
        nextLabel="Next month"
      />
    ),
    months: (
      <CalendarHeader
        label={String(pickYear)}
        onLabelPress={() => {
          setYearBase(yearPageStart(pickYear));
          setView('years');
        }}
        labelAccessibility="Choose year"
        onPrev={() => setPickYear(pickYear - 1)}
        onNext={() => setPickYear(pickYear + 1)}
        prevDisabled={isMonthOutOfBounds(new Date(pickYear - 1, 11, 1), startMonth, undefined)}
        nextDisabled={isMonthOutOfBounds(new Date(pickYear + 1, 0, 1), undefined, endMonth)}
        prevLabel="Previous year"
        nextLabel="Next year"
      />
    ),
    years: (
      <CalendarHeader
        label={`${yearBase} – ${yearBase + YEARS_PER_PAGE - 1}`}
        onPrev={() => setYearBase(yearBase - YEARS_PER_PAGE)}
        onNext={() => setYearBase(yearBase + YEARS_PER_PAGE)}
        prevDisabled={isMonthOutOfBounds(new Date(yearBase - 1, 11, 1), startMonth, undefined)}
        nextDisabled={isMonthOutOfBounds(new Date(yearBase + YEARS_PER_PAGE, 0, 1), undefined, endMonth)}
        prevLabel="Previous years"
        nextLabel="Next years"
      />
    ),
  }[view];

  return (
    <View ref={ref} style={[s.base.root, style]}>
      {header}
      {view === 'days' && (
        <View ref={bodyRef} style={s.base.body} onLayout={(e) => drag.setWidth(e.nativeEvent.layout.width)} {...drag.panHandlers}>
          {Array.from({ length: count }, (_, i) => {
            const m = addMonths(visible, i);
            return (
              <MonthGrid
                key={monthIndex(m)}
                month={m}
                weekStartsOn={weekStartsOn}
                fixedWeeks={fixedWeeks}
                hideOutside={hideOutside}
                caption={i > 0 ? caption.format(m) : undefined}
                weekdayLabels={weekdayLabels}
                dayLabel={(d) => dayLabel.format(d)}
                today={today}
                isDisabled={isDisabled}
                getState={getState}
                onSelect={select}
                onRows={drag.setRows}
                onUnmount={drag.clearRows}
              />
            );
          })}
        </View>
      )}
      {view === 'months' && (
        <MonthPicker
          locale={locale}
          isSelected={(m) => visible.getFullYear() === pickYear && visible.getMonth() === m}
          isDisabled={(m) => out(new Date(pickYear, m, 1))}
          onPick={(m) => {
            goTo(new Date(pickYear, m, 1));
            setView('days');
          }}
        />
      )}
      {view === 'years' && (
        <YearPicker
          locale={locale}
          firstYear={yearBase}
          count={YEARS_PER_PAGE}
          selectedYear={visible.getFullYear()}
          isDisabled={(y) => isMonthOutOfBounds(new Date(y, 11, 1), startMonth, undefined) || isMonthOutOfBounds(new Date(y, 0, 1), undefined, endMonth)}
          onPick={(y) => {
            setPickYear(y);
            setView('months');
          }}
        />
      )}
    </View>
  );
}
