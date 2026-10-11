import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Example() {
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 8 }}>
        <Label>Username</Label>
        <Input placeholder="marco" />
      </View>
      <View style={{ gap: 8 }}>
        <Label disabled>Disabled field</Label>
        <Input placeholder="Not editable" disabled />
      </View>
    </View>
  );
}
