import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue,
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
        <ComboboxTrigger style={styles.trigger}>
          <ComboboxValue placeholder="Select framework..." />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search framework..." />
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
      <View style={styles.row}>
        <Text variant="muted">{`Value: ${framework ?? 'none'}`}</Text>
        <Button size="sm" variant="outline" onPress={() => setFramework('remix')}>Set Remix</Button>
        <Button size="sm" variant="outline" onPress={() => setFramework(null)}>Clear</Button>
      </View>

      <Combobox items={desserts} multiple defaultValue={['Tiramisù']}>
        <ComboboxTrigger style={styles.multi}>
          <ComboboxValue>
            {(selected) =>
              selected.length === 0 ? (
                <Text variant="muted">Pick desserts...</Text>
              ) : (
                <View style={styles.chips}>
                  {selected.map((o) => <Badge key={o.value} variant="secondary">{o.label}</Badge>)}
                </View>
              )
            }
          </ComboboxValue>
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search desserts (try creme)..." />
          <ComboboxEmpty>No dessert found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>

      <Combobox items={countries} defaultValue="italy">
        <ComboboxTrigger size="sm" style={styles.trigger}>
          <ComboboxValue placeholder="Country" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search country (try usa)..." />
          <ComboboxEmpty>No country found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>

      <Combobox items={people}>
        <ComboboxTrigger style={styles.trigger}>
          <ComboboxValue placeholder="Assign to..." />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search people..." />
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

      <Combobox items={frameworks} disabled>
        <ComboboxTrigger style={styles.trigger}>
          <ComboboxValue placeholder="Disabled" />
        </ComboboxTrigger>
      </Combobox>
    </Section>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 220 },
  multi: { width: 260, minHeight: 36, height: 'auto', paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flexShrink: 1 },
  name: { fontSize: 14 },
});
