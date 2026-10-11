import { View } from 'react-native';
import { Toggle } from '@/components/ui/toggle';

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Toggle>Bold</Toggle>
      <Toggle variant="outline">Italic</Toggle>
      <Toggle variant="outline" defaultPressed>Underline</Toggle>
    </View>
  );
}
