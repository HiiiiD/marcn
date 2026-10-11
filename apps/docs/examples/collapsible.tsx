import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Text } from '@/components/ui/text';

export default function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger render={<Button variant="outline" />}>Toggle details</CollapsibleTrigger>
      <CollapsibleContent>
        <View style={{ paddingTop: 12 }}>
          <Text>Hidden until the trigger is pressed.</Text>
        </View>
      </CollapsibleContent>
    </Collapsible>
  );
}
