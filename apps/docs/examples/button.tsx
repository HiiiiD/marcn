import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Button><Text>Default</Text></Button>
      <Button variant="secondary"><Text>Secondary</Text></Button>
      <Button variant="outline"><Text>Outline</Text></Button>
      <Button variant="destructive"><Text>Destructive</Text></Button>
      <Button variant="ghost"><Text>Ghost</Text></Button>
    </View>
  );
}
