import { View } from 'react-native';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <Text>Above</Text>
      <Separator />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 20 }}>
        <Text>Left</Text>
        <Separator orientation="vertical" />
        <Text>Right</Text>
      </View>
    </View>
  );
}
