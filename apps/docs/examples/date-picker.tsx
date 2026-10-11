import { useState } from 'react';
import { View } from 'react-native';
import type { DateRange } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [date, setDate] = useState<Date | undefined>();
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <View style={{ gap: 12, width: 280 }}>
      <DatePicker selected={date} onSelect={setDate} />
      <Text variant="muted">{date ? date.toDateString() : 'No date'}</Text>
      <DatePicker mode="range" selected={range} onSelect={setRange} placeholder="Pick a range" />
    </View>
  );
}
