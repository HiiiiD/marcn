import { View } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Skeleton style={{ width: 48, height: 48, borderRadius: 24 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton style={{ height: 16 }} />
        <Skeleton style={{ height: 16, width: '60%' }} />
      </View>
    </View>
  );
}
