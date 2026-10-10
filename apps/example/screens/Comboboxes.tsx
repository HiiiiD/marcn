import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxCollection, ComboboxContent, ComboboxEmpty, ComboboxGroup,
  ComboboxInput, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator, ComboboxTrigger, ComboboxValue, type ComboboxOptionGroup,
} from '@/components/ui/combobox';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'gatsby', label: 'Gatsby', disabled: true },
];

const desserts = ['Crème brûlée', 'Tiramisù', 'Pavlova', 'Baklava', 'Mochi', 'Churros', 'Gelato', 'Panna cotta'];

const countries = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czechia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland',
  'Italy', 'Japan', 'Kenya', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Peru', 'Poland',
  'Portugal', 'Romania', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand',
  'Turkey', 'Ukraine', 'United Kingdom', 'United States', 'Uruguay', 'Vietnam',
].map((label) => ({ value: label.toLowerCase().replace(/ /g, '-'), label, keywords: label === 'United States' ? ['USA'] : undefined }));

const produce = [
  { value: 'Fruits', items: ['Apple', 'Banana', 'Cherry', 'Mango'] },
  { value: 'Vegetables', items: ['Carrot', 'Leek', 'Pepper', 'Spinach'] },
];

const people = [
  { value: 'ada', label: 'Ada Lovelace', role: 'Mathematician' },
  { value: 'grace', label: 'Grace Hopper', role: 'Rear admiral' },
  { value: 'alan', label: 'Alan Turing', role: 'Computer scientist' },
  { value: 'linus', label: 'Linus Torvalds', role: 'Kernel maintainer' },
];

export function Comboboxes() {
  const [framework, setFramework] = useState<string | null>(null);
  return (
    <Section title="Combobox">
      <Combobox items={frameworks} value={framework} onValueChange={setFramework}>
        <ComboboxInput placeholder="Select framework..." showClear containerStyle={styles.field} />
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
      <View style={styles.row}>
        <Text variant="muted">{`Value: ${framework ?? 'none'}`}</Text>
        <Button size="sm" variant="outline" onPress={() => setFramework('remix')}>Set Remix</Button>
      </View>

      <Combobox items={frameworks}>
        <ComboboxTrigger>
          <ComboboxValue placeholder="Search in the popup..." />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>

      <Combobox items={desserts} multiple defaultValue={['Tiramisù']}>
        <ComboboxChips style={styles.field}>
          <ComboboxValue>
            {(selected) => selected.map((o) => <ComboboxChip key={o.value} value={o.value} />)}
          </ComboboxValue>
          <ComboboxChipsInput placeholder="Add dessert..." />
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxEmpty>No dessert found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>

      <Combobox items={countries} defaultValue="italy">
        <ComboboxInput placeholder="Country (try usa)..." showClear containerStyle={styles.field} />
        <ComboboxContent>
          <ComboboxEmpty>No country found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>

      <Combobox items={produce}>
        <ComboboxInput placeholder="Produce (groups)..." containerStyle={styles.field} />
        <ComboboxContent>
          <ComboboxEmpty>Nothing found.</ComboboxEmpty>
          <ComboboxList<ComboboxOptionGroup>>
            {(group, index) => (
              <ComboboxGroup items={group.items}>
                {index > 0 ? <ComboboxSeparator /> : null}
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection />
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Combobox items={people}>
        <ComboboxInput placeholder="Assign to..." containerStyle={styles.field} />
        <ComboboxContent>
          <ComboboxEmpty>Nobody found.</ComboboxEmpty>
          <ComboboxList<(typeof people)[number]>>
            {(person) => (
              <ComboboxItem value={person.value}>
                <View>
                  <Text style={styles.name}>{person.label}</Text>
                  <Text variant="muted">{person.role}</Text>
                </View>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Combobox items={frameworks} disabled defaultValue="next">
        <ComboboxInput placeholder="Disabled" containerStyle={styles.field} />
      </Combobox>
    </Section>
  );
}

const styles = StyleSheet.create({
  field: { width: 280 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 14 },
});
