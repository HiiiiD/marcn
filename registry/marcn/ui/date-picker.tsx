import { useState, type Ref } from 'react';
import { StyleSheet, type StyleProp, type View, type ViewStyle } from 'react-native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import type { AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Button } from '@/registry/marcn/ui/button';
import { Calendar, type CalendarProps, type DateRange } from '@/registry/marcn/ui/calendar';
import { Icon } from '@/registry/marcn/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/registry/marcn/ui/popover';
import { Text } from '@/registry/marcn/ui/text';

export type { DateRange };

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

const createStyles = (t: Theme) =>
  StyleSheet.create({
    trigger: { justifyContent: 'flex-start', paddingHorizontal: t.spacing[3] },
    label: { flexShrink: 1, fontWeight: t.fontWeight.normal },
    placeholder: { color: t.colors.mutedForeground },
  });

const SINGLE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'long' };
const RANGE_FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' };

export function DatePicker(props: DatePickerProps) {
  const {
    placeholder = 'Pick a date',
    formatDate,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    triggerDisabled,
    testID,
    style,
    contentStyle,
    ref,
    side,
    align = 'start',
    sideOffset,
    alignOffset,
    selected: _selected,
    defaultSelected: _defaultSelected,
    onSelect: _onSelect,
    ...calendar
  } = props;
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const isRange = props.mode === 'range';

  // Controlled by key presence: `selected={undefined}` is a cleared value, not a switch to
  // uncontrolled (useControllableState would resurrect the last internal pick).
  const controlled = 'selected' in props;
  const [inner, setInner] = useState<Date | DateRange | undefined>(props.defaultSelected);
  const value = controlled ? props.selected : inner;
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });

  const format = formatDate ?? ((date: Date) => new Intl.DateTimeFormat(props.locale, isRange ? RANGE_FORMAT : SINGLE_FORMAT).format(date));
  let label: string | undefined;
  if (isRange) {
    const range = value as DateRange | undefined;
    if (range?.from) label = range.to ? `${format(range.from)} – ${format(range.to)}` : format(range.from);
  } else if (value) {
    label = format(value as Date);
  }

  const select = (next: Date | DateRange | undefined) => {
    if (!controlled) setInner(next);
    (props.onSelect as ((value: Date | DateRange | undefined) => void) | undefined)?.(next);
    if (closeOnSelect && (!isRange || (next as DateRange | undefined)?.to)) setOpen(false);
  };

  // null keeps Calendar controlled when nothing is picked, for the same reason as above.
  const calendarProps = { ...calendar, selected: value ?? null, onSelect: select } as unknown as CalendarProps;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={triggerDisabled}
            accessibilityState={{ disabled: !!triggerDisabled, expanded: open }}
            testID={testID}
            style={[s.trigger, style]}
            ref={ref}
          />
        }
      >
        <Icon icon={CalendarIcon} color={label ? colors.foreground : colors.mutedForeground} />
        <Text numberOfLines={1} style={[s.label, !label && s.placeholder]}>
          {label ?? placeholder}
        </Text>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} style={contentStyle}>
        <Calendar {...calendarProps} />
      </PopoverContent>
    </Popover>
  );
}
