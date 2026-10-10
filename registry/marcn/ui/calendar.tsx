import { useMemo, type Ref } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
  addMonths,
  getMonthWeeks,
  getWeekdays,
  inRange,
  isMatch,
  isSameDay,
  isSameMonth,
  nextRange,
  startOfMonth,
  toggleDate,
  toggleDates,
  type DateRange,
  type Matcher,
} from '@/registry/marcn/lib/calendar-math';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Button } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';

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
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  disabled?: Matcher | Matcher[];
  showOutsideDays?: boolean;
  fixedWeeks?: boolean;
  style?: StyleProp<ViewStyle>;
  ref?: Ref<View>;
};

const CELL = 36;

const createStyles = (t: Theme) => ({
  base: StyleSheet.create({
    root: { gap: t.spacing[3], alignSelf: 'stretch' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    caption: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium },
    row: { flexDirection: 'row' },
    weekday: { flex: 1, textAlign: 'center', fontSize: t.fontSize.xs, color: t.colors.mutedForeground },
    cell: { flex: 1, height: CELL, alignItems: 'center', justifyContent: 'center', borderRadius: t.radius.md },
    today: { backgroundColor: t.colors.accent },
    inRange: { backgroundColor: t.colors.accent, borderRadius: 0 },
    selected: { backgroundColor: t.colors.primary },
    pressed: { backgroundColor: t.colors.accent },
    disabled: { opacity: 0.5 },
    outside: { opacity: 0.5 },
  }),
  text: StyleSheet.create({
    day: { fontSize: t.fontSize.sm, color: t.colors.foreground },
    outside: { color: t.colors.mutedForeground },
    selected: { color: t.colors.primaryForeground },
    inRange: { color: t.colors.accentForeground },
  }),
});

const asArray = (value: unknown): Date[] => (Array.isArray(value) ? value : value instanceof Date ? [value] : []);

export function Calendar(props: CalendarProps) {
  const { month, defaultMonth, onMonthChange, weekStartsOn = 0, locale, disabled, showOutsideDays = true, fixedWeeks, style, ref } = props;
  const s = useStyles(createStyles);
  const mode = props.mode ?? 'single';

  const [selected, setSelected] = useControllableState<unknown>({
    value: props.selected,
    defaultValue: props.defaultSelected,
    onChange: props.onSelect as ((value: unknown) => void) | undefined,
  });
  const initial = defaultMonth ?? asArray(mode === 'range' ? (selected as DateRange | undefined)?.from : selected)[0] ?? new Date();
  const [visible, setVisible] = useControllableState<Date>({
    value: month && startOfMonth(month),
    defaultValue: startOfMonth(initial),
    onChange: onMonthChange,
  });

  const today = new Date();
  const weeks = useMemo(() => getMonthWeeks(visible, weekStartsOn, fixedWeeks), [visible, weekStartsOn, fixedWeeks]);
  const weekdays = useMemo(() => getWeekdays(weekStartsOn), [weekStartsOn]);
  const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options);
  const caption = fmt({ month: 'long', year: 'numeric' });
  const weekdayName = fmt({ weekday: 'short' });
  const dayLabel = fmt({ dateStyle: 'full' });

  const select = (date: Date) => {
    if (mode === 'multiple') {
      const { min, max } = props as { min?: number; max?: number };
      setSelected(toggleDates(selected as Date[] | undefined, date, min, max));
    } else if (mode === 'range') {
      setSelected(nextRange(selected as DateRange | undefined, date));
    } else {
      setSelected(toggleDate(selected as Date | undefined, date, (props as { required?: boolean }).required));
    }
  };

  const isSelected = (date: Date) =>
    mode === 'range'
      ? [(selected as DateRange | undefined)?.from, (selected as DateRange | undefined)?.to].some((d) => d && isSameDay(d, date))
      : asArray(selected).some((d) => isSameDay(d, date));

  return (
    <View ref={ref} style={[s.base.root, style]}>
      <View style={s.base.header}>
        <Button variant="outline" size="icon" accessibilityLabel="Previous month" onPress={() => setVisible(addMonths(visible, -1))}>
          <Icon icon={ChevronLeft} />
        </Button>
        <Text accessibilityRole="header" style={s.base.caption}>
          {caption.format(visible)}
        </Text>
        <Button variant="outline" size="icon" accessibilityLabel="Next month" onPress={() => setVisible(addMonths(visible, 1))}>
          <Icon icon={ChevronRight} />
        </Button>
      </View>
      <View>
        <View style={s.base.row}>
          {weekdays.map((d) => (
            <Text key={d.getDay()} numberOfLines={1} style={s.base.weekday}>
              {weekdayName.format(d)}
            </Text>
          ))}
        </View>
        {weeks.map((week) => (
          <View key={week[0].getTime()} style={s.base.row}>
            {week.map((date) => {
              const outside = !isSameMonth(date, visible);
              if (outside && !showOutsideDays) return <View key={date.getTime()} style={s.base.cell} />;
              const off = isMatch(date, disabled);
              const on = isSelected(date);
              const middle = mode === 'range' && !on && inRange(date, selected as DateRange | undefined);
              return (
                <Pressable
                  key={date.getTime()}
                  accessibilityRole="button"
                  accessibilityLabel={dayLabel.format(date)}
                  accessibilityState={{ selected: on || middle, disabled: off }}
                  disabled={off}
                  onPress={() => select(date)}
                  style={({ pressed }) => [
                    s.base.cell,
                    isSameDay(date, today) && s.base.today,
                    middle && s.base.inRange,
                    pressed && !on && s.base.pressed,
                    on && s.base.selected,
                    outside && s.base.outside,
                    off && s.base.disabled,
                  ]}
                >
                  <Text style={[s.text.day, outside && s.text.outside, middle && s.text.inRange, on && s.text.selected]}>{date.getDate()}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
