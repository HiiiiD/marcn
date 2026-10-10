import { useState } from 'react';
import { Calendar, type DateRange } from '@/components/ui/calendar';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

export function Calendars() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>();
  const [days, setDays] = useState<Date[] | undefined>();
  const [span, setSpan] = useState<DateRange | undefined>();

  return (
    <>
      <Section title="Calendar">
        <Calendar selected={date} onSelect={setDate} disabled={{ dayOfWeek: [0] }} captionLayout="dropdown" startMonth={new Date(2020, 0, 1)} endMonth={new Date(2030, 11, 1)} />
        <Text variant="muted">{date ? date.toDateString() : 'No date'}</Text>
      </Section>
      <Section title="Calendar range (tap or drag)">
        <Calendar mode="range" selected={range} onSelect={setRange} weekStartsOn={1} fixedWeeks />
        <Text variant="muted">{range?.from ? `${range.from.toDateString()} → ${range.to ? range.to.toDateString() : '…'}` : 'No range'}</Text>
      </Section>
      <Section title="Calendar 2 months range">
        <Calendar mode="range" numberOfMonths={2} selected={span} onSelect={setSpan} />
      </Section>
      <Section title="Calendar multiple (max 3)">
        <Calendar mode="multiple" max={3} selected={days} onSelect={setDays} locale="it-IT" weekStartsOn={1} />
      </Section>
    </>
  );
}
