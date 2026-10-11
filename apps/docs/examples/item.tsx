import { ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from '@/components/ui/item';

export default function Example() {
  return (
    <View style={{ gap: 16 }}>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <Icon icon={ShieldCheck} size={16} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Two-factor authentication</ItemTitle>
          <ItemDescription>Verify your identity with a code when signing in.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">Enable</Button>
        </ItemActions>
      </Item>
      <ItemGroup>
        <Item>
          <ItemContent><ItemTitle>First</ItemTitle></ItemContent>
        </Item>
        <ItemSeparator />
        <Item>
          <ItemContent><ItemTitle>Second</ItemTitle></ItemContent>
        </Item>
      </ItemGroup>
    </View>
  );
}
