import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <View style={{ gap: 8 }}>
      <Text>Default body text</Text>
      <Text variant="small">Small text</Text>
      <Text variant="muted">Muted text for secondary information.</Text>
    </View>
  );
}
