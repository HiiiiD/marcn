import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group';

export default function Example() {
  return (
    <View style={{ gap: 16, alignItems: 'flex-start' }}>
      <ButtonGroup>
        <Button variant="outline">Left</Button>
        <Button variant="outline">Middle</Button>
        <Button variant="outline">Right</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button>Save</Button>
        <ButtonGroupSeparator />
        <Button>Cancel</Button>
      </ButtonGroup>
      <ButtonGroup>
        <ButtonGroupText>https://</ButtonGroupText>
        <Button variant="outline">Go</Button>
      </ButtonGroup>
    </View>
  );
}
