import { View } from 'react-native';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function Example() {
  return (
    <View style={{ gap: 16, alignItems: 'flex-start' }}>
      <ToggleGroup type="multiple" variant="outline">
        <ToggleGroupItem value="bold">B</ToggleGroupItem>
        <ToggleGroupItem value="italic">I</ToggleGroupItem>
        <ToggleGroupItem value="underline">U</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" spacing={2} defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </View>
  );
}
