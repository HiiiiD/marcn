import type { Ref } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';
import type { AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import type { CalendarProps, DateRange } from '@/registry/marcn/ui/calendar';

type Selection<T> = { selected?: T; defaultSelected?: T; onSelect?: (selected: T | undefined) => void };
type ModeProps = ({ mode?: 'single'; required?: boolean } & Selection<Date>) | ({ mode: 'range' } & Selection<DateRange>);

type ForwardedCalendarProps = Pick<
  CalendarProps,
  | 'month'
  | 'defaultMonth'
  | 'onMonthChange'
  | 'startMonth'
  | 'endMonth'
  | 'numberOfMonths'
  | 'captionLayout'
  | 'weekStartsOn'
  | 'locale'
  | 'disabled'
  | 'showOutsideDays'
  | 'fixedWeeks'
>;

export type DatePickerProps = ModeProps &
  ForwardedCalendarProps &
  Pick<AnchoredOptions, 'side' | 'align' | 'sideOffset' | 'alignOffset'> & {
    placeholder?: string;
    formatDate?: (date: Date) => string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    closeOnSelect?: boolean;
    triggerDisabled?: boolean;
    testID?: string;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
    ref?: Ref<View>;
  };
