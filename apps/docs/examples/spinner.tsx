import { View } from 'react-native';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Spinner />
      <Spinner size={24} />
      <Spinner size={32} color="#e7000b" />
      <Text variant="muted">Loading...</Text>
    </View>
  );
}
