import { useState } from 'react';
import { View } from 'react-native';
import { Calendar, type DateRange } from '@/components/ui/calendar';
import { Text } from '@/components/ui/text';

export default function Example() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <View style={{ gap: 16 }}>
      <Calendar selected={date} onSelect={setDate} />
      <Text variant="muted">{date ? date.toDateString() : 'No date'}</Text>
      <Calendar mode="range" selected={range} onSelect={setRange} weekStartsOn={1} />
      <Text variant="muted">
        {range?.from ? `${range.from.toDateString()} - ${range.to ? range.to.toDateString() : '...'}` : 'No range'}
      </Text>
    </View>
  );
}
