import { useState } from 'react';
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function Example() {
  const [plan, setPlan] = useState('pro');
  return (
    <RadioGroup value={plan} onValueChange={setPlan}>
      {['free', 'pro', 'team'].map((p) => (
        <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <RadioGroupItem value={p} />
          <Label>{p}</Label>
        </View>
      ))}
    </RadioGroup>
  );
}
