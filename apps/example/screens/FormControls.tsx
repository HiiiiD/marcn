import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Section } from './Section';

export function FormControls() {
  const [volume, setVolume] = useState([40]);
  const [range, setRange] = useState([20, 80]);

  return (
    <>
      <Section title="Tabs">
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Text>Make changes to your account here.</Text>
          </TabsContent>
          <TabsContent value="password">
            <Text>Change your password here.</Text>
          </TabsContent>
        </Tabs>
      </Section>
      <Section title="Accordion">
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>Yes. It sets expanded state on each trigger.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Is it animated?</AccordionTrigger>
            <AccordionContent>Yes, the height animates with reanimated.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>
      <Section title="Collapsible">
        <Collapsible>
          <CollapsibleTrigger render={<Button variant="outline" />}>Toggle details</CollapsibleTrigger>
          <CollapsibleContent>
            <Text>Hidden until opened.</Text>
          </CollapsibleContent>
        </Collapsible>
      </Section>
      <Section title="Toggle">
        <View style={styles.row}>
          <Toggle>Bold</Toggle>
          <Toggle variant="outline">Italic</Toggle>
        </View>
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="bold">B</ToggleGroupItem>
          <ToggleGroupItem value="italic">I</ToggleGroupItem>
          <ToggleGroupItem value="underline">U</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" spacing={2} defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
        </ToggleGroup>
      </Section>
      <Section title="Slider">
        <Slider value={volume} onValueChange={setVolume} />
        <Text variant="muted">{volume[0]}</Text>
        <Slider value={range} onValueChange={setRange} minStepsBetweenThumbs={5} />
        <Text variant="muted">
          {range[0]} to {range[1]}
        </Text>
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
});
