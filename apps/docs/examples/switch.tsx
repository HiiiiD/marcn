import { useState } from 'react';
import { View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function Example() {
  const [on, setOn] = useState(true);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Switch checked={on} onCheckedChange={setOn} accessibilityLabel="Airplane mode" />
      <Label>Airplane mode</Label>
    </View>
  );
}
