import { View } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Avatar>
        <AvatarImage source={{ uri: 'https://i.pravatar.cc/100?img=12' }} />
        <AvatarFallback><Text>MS</Text></AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback><Text>AB</Text></AvatarFallback>
      </Avatar>
      <Avatar size={56}>
        <AvatarFallback><Text>LG</Text></AvatarFallback>
      </Avatar>
    </View>
  );
}
