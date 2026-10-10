import { useState } from 'react';
import { StyleSheet } from 'react-native';
import type { DateRange } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

export function DatePickers() {
  const [date, setDate] = useState<Date | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();
  const [due, setDue] = useState<Date | undefined>(new Date());

  return (
    <>
      <Section title="Date Picker">
        <DatePicker selected={date} onSelect={setDate} style={styles.trigger} />
        <Text variant="muted">{date ? date.toDateString() : 'No date'}</Text>
      </Section>
      <Section title="Date Picker range">
        <DatePicker mode="range" selected={range} onSelect={setRange} numberOfMonths={2} placeholder="Pick a range" style={styles.trigger} />
      </Section>
      <Section title="Date Picker (it-IT, dropdown, no Sundays)">
        <DatePicker
          selected={due}
          onSelect={setDue}
          locale="it-IT"
          weekStartsOn={1}
          captionLayout="dropdown"
          disabled={{ dayOfWeek: [0] }}
          placeholder="Scegli una data"
          style={styles.trigger}
        />
      </Section>
      <Section title="Date Picker disabled">
        <DatePicker triggerDisabled style={styles.trigger} />
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 280 },
});
