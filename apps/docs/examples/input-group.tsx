import { Search } from 'lucide-react-native';
import { View } from 'react-native';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group';

export default function Example() {
  return (
    <View style={{ gap: 12 }}>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="example.com" />
      </InputGroup>
      <InputGroup>
        <InputGroupInput placeholder="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" accessibilityLabel="Search">
            <Search size={14} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </View>
  );
}
