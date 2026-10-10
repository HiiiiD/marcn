import { useEffect, useMemo, useRef } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { getMonthWeeks, isSameDay, isSameMonth, monthIndex } from '@/registry/marcn/lib/calendar-math';
import type { RowsLayout } from '@/registry/marcn/lib/calendar-range-drag';
import { createCalendarStyles } from '@/registry/marcn/lib/calendar-styles';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';

export type DayState = 'selected' | 'middle' | undefined;

export type MonthGridProps = {
  month: Date;
  weekStartsOn: number;
  fixedWeeks?: boolean;
  hideOutside: boolean;
  caption?: string;
  weekdayLabels: string[];
  dayLabel: (date: Date) => string;
  today: Date;
  isDisabled: (date: Date) => boolean;
  getState: (date: Date) => DayState;
  onSelect: (date: Date) => void;
  onRows: (key: number, rows: RowsLayout) => void;
  onUnmount: (key: number) => void;
};

export function MonthGrid({
  month,
  weekStartsOn,
  fixedWeeks,
  hideOutside,
  caption,
  weekdayLabels,
  dayLabel,
  today,
  isDisabled,
  getState,
  onSelect,
  onRows,
  onUnmount,
}: MonthGridProps) {
  const s = useStyles(createCalendarStyles);
  const weeks = useMemo(() => getMonthWeeks(month, weekStartsOn, fixedWeeks), [month, weekStartsOn, fixedWeeks]);
  const key = monthIndex(month);
  const offsets = useRef({ block: 0, rows: 0 });

  const report = () => onRows(key, { top: offsets.current.block + offsets.current.rows, weeks, month, hideOutside });
  const onBlockLayout = (e: LayoutChangeEvent) => {
    offsets.current.block = e.nativeEvent.layout.y;
    report();
  };
  const onRowsLayout = (e: LayoutChangeEvent) => {
    offsets.current.rows = e.nativeEvent.layout.y;
    report();
  };
  useEffect(() => () => onUnmount(key), [key, onUnmount]);

  return (
    <View style={s.base.month} onLayout={onBlockLayout}>
      {caption ? <Text style={s.base.caption}>{caption}</Text> : null}
      <View style={s.base.row}>
        {weekdayLabels.map((label, i) => (
          <Text key={i} numberOfLines={1} style={s.base.weekday}>
            {label}
          </Text>
        ))}
      </View>
      <View onLayout={onRowsLayout}>
        {weeks.map((week) => (
          <View key={week[0].getTime()} style={s.base.row}>
            {week.map((date) => {
              const outside = !isSameMonth(date, month);
              if (outside && hideOutside) return <View key={date.getTime()} style={s.base.cell} />;
              const off = isDisabled(date);
              const state = getState(date);
              const on = state === 'selected';
              const middle = state === 'middle';
              return (
                <Pressable
                  key={date.getTime()}
                  accessibilityRole="button"
                  accessibilityLabel={dayLabel(date)}
                  accessibilityState={{ selected: on || middle, disabled: off }}
                  disabled={off}
                  onPress={() => onSelect(date)}
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
