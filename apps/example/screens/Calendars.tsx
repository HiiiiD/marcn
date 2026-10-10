import { useState } from 'react';
import { Calendar, type DateRange } from '@/components/ui/calendar';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

export function Calendars() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>();
  const [days, setDays] = useState<Date[] | undefined>();

  return (
    <>
      <Section title="Calendar">
        <Calendar selected={date} onSelect={setDate} disabled={{ dayOfWeek: [0] }} />
        <Text variant="muted">{date ? date.toDateString() : 'No date'}</Text>
      </Section>
      <Section title="Calendar range">
        <Calendar mode="range" selected={range} onSelect={setRange} weekStartsOn={1} fixedWeeks />
      </Section>
      <Section title="Calendar multiple (max 3)">
        <Calendar mode="multiple" max={3} selected={days} onSelect={setDays} locale="it-IT" weekStartsOn={1} />
      </Section>
    </>
  );
}
