import { Search, Send } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Section } from './Section';

export function Groups() {
  return (
    <>
      <Section title="Button group">
        <View style={styles.row}>
          <ButtonGroup>
            <Button variant="outline">Left</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Right</Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button variant="outline">Top</Button>
            <Button variant="outline">Middle</Button>
            <Button variant="outline">Bottom</Button>
          </ButtonGroup>
        </View>
        <ButtonGroup>
          <Button>Save</Button>
          <ButtonGroupSeparator />
          <Button>Cancel</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Button variant="outline">Go</Button>
        </ButtonGroup>
      </Section>
      <Section title="Input group">
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
        <InputGroup>
          <InputGroupTextarea placeholder="Write a message" />
          <InputGroupAddon align="block-end">
            <InputGroupText>0 / 280</InputGroupText>
            <InputGroupButton size="icon-sm" variant="default" accessibilityLabel="Send">
              <Send size={14} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Invalid" aria-invalid />
        </InputGroup>
        <InputGroup disabled>
          <InputGroupInput placeholder="Disabled" />
        </InputGroup>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16 },
});
