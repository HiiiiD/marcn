import { useState } from 'react';
import { View } from 'react-native';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxList } from '@/components/ui/combobox';
import { Text } from '@/components/ui/text';

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt.js' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'gatsby', label: 'Gatsby', disabled: true },
];

export default function Example() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <View style={{ gap: 8 }}>
      <Combobox items={frameworks} value={value} onValueChange={setValue}>
        <ComboboxInput placeholder="Select framework..." showClear containerStyle={{ width: 280 }} />
        <ComboboxContent>
          <ComboboxEmpty>No framework found.</ComboboxEmpty>
          <ComboboxList />
        </ComboboxContent>
      </Combobox>
      <Text variant="muted">{`Value: ${value ?? 'none'}`}</Text>
    </View>
  );
}
