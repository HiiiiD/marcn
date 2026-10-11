import type { StyleProp, ViewStyle, View } from 'react-native';
import type { Ref } from 'react';
import type { DateRange, Matcher } from '@/registry/marcn/ui/calendar/math';

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
