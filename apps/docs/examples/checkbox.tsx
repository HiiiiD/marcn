import { useState } from 'react';
import { View } from 'react-native';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function Example() {
  const [terms, setTerms] = useState(true);
  const [news, setNews] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Checkbox checked={terms} onCheckedChange={setTerms} />
        <Label>Accept terms and conditions</Label>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Checkbox checked={news} onCheckedChange={setNews} />
        <Label>Subscribe to newsletter</Label>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Checkbox checked="indeterminate" disabled />
        <Label>Indeterminate (disabled)</Label>
      </View>
    </View>
  );
}
