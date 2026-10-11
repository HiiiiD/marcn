import { useMemo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { createCalendarStyles } from '@/registry/marcn/ui/calendar/styles';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Button } from '@/registry/marcn/ui/button';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text } from '@/registry/marcn/ui/text';

export type CalendarHeaderProps = {
  label: ReactNode;
  onLabelPress?: () => void;
  labelAccessibility?: string;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  prevLabel: string;
  nextLabel: string;
};

export function CalendarHeader({ label, onLabelPress, labelAccessibility, onPrev, onNext, prevDisabled, nextDisabled, prevLabel, nextLabel }: CalendarHeaderProps) {
  const s = useStyles(createCalendarStyles);
  const caption = (
    <Text accessibilityRole={onLabelPress ? undefined : 'header'} style={s.base.caption}>
      {label}
    </Text>
  );
  return (
    <View style={s.base.header}>
      <Button variant="outline" size="icon" accessibilityLabel={prevLabel} disabled={prevDisabled} onPress={onPrev}>
        <Icon icon={ChevronLeft} />
      </Button>
      {onLabelPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={labelAccessibility}
          onPress={onLabelPress}
          style={({ pressed }) => [s.base.captionButton, pressed && s.base.pressed]}
        >
          {caption}
          <Icon icon={ChevronDown} size={14} />
        </Pressable>
      ) : (
        caption
      )}
      <Button variant="outline" size="icon" accessibilityLabel={nextLabel} disabled={nextDisabled} onPress={onNext}>
        <Icon icon={ChevronRight} />
      </Button>
    </View>
  );
}

type Item = { key: number; label: string; selected: boolean; disabled: boolean };

function PickerGrid({ items, onPick }: { items: Item[]; onPick: (key: number) => void }) {
  const s = useStyles(createCalendarStyles);
  return (
    <View style={s.base.picker}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          accessibilityState={{ selected: item.selected, disabled: item.disabled }}
          disabled={item.disabled}
          onPress={() => onPick(item.key)}
          style={({ pressed }) => [s.base.pick, pressed && !item.selected && s.base.pressed, item.selected && s.base.selected, item.disabled && s.base.disabled]}
        >
          <Text style={[s.text.day, item.selected && s.text.selected]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export type MonthPickerProps = { locale?: string; isSelected: (month: number) => boolean; isDisabled: (month: number) => boolean; onPick: (month: number) => void };

export function MonthPicker({ locale, isSelected, isDisabled, onPick }: MonthPickerProps) {
  const fmt = useMemo(() => new Intl.DateTimeFormat(locale, { month: 'short' }), [locale]);
  const items = Array.from({ length: 12 }, (_, m) => ({ key: m, label: fmt.format(new Date(2023, m, 1)), selected: isSelected(m), disabled: isDisabled(m) }));
  return <PickerGrid items={items} onPick={onPick} />;
}

export type YearPickerProps = {
  locale?: string;
  firstYear: number;
  count: number;
  selectedYear: number;
  isDisabled: (year: number) => boolean;
  onPick: (year: number) => void;
};

export function YearPicker({ locale, firstYear, count, selectedYear, isDisabled, onPick }: YearPickerProps) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale]);
  const items = Array.from({ length: count }, (_, i) => {
    const year = firstYear + i;
    return { key: year, label: fmt.format(year), selected: year === selectedYear, disabled: isDisabled(year) };
  });
  return <PickerGrid items={items} onPick={onPick} />;
}
