import { Bell, Heart, Settings, Star } from 'lucide-react-native';
import { View } from 'react-native';
import { Icon } from '@/components/ui/icon';

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Icon icon={Bell} />
      <Icon icon={Heart} size={24} color="#e7000b" />
      <Icon icon={Star} size={32} color="#f59e0b" />
      <Icon icon={Settings} size={40} />
    </View>
  );
}
