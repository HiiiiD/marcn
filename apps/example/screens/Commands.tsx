import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, CreditCard, Settings, Smile, User } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from '@/components/ui/command';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Section } from './Section';

const countries = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czechia',
  'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland',
  'Italy', 'Japan', 'Kenya', 'Mexico', 'Morocco', 'Netherlands', 'Norway', 'Peru', 'Poland', 'Portugal', 'Spain', 'Sweden',
];

function Palette({ onSelect }: { onSelect: (value: string) => void }) {
  return (
    <>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={onSelect}><Icon icon={Calendar} />Calendar</CommandItem>
          <CommandItem onSelect={onSelect}><Icon icon={Smile} />Search Emoji</CommandItem>
          <CommandItem disabled onSelect={onSelect}>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="profile" keywords={['account']} onSelect={onSelect}>
            <Icon icon={User} />Profile<CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem value="billing" onSelect={onSelect}>
            <Icon icon={CreditCard} />Billing<CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem value="settings" onSelect={onSelect}>
            <Icon icon={Settings} />Settings<CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

export function Commands() {
  const [last, setLast] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <Section title="Command">
      <Command style={styles.inline}>
        <Palette onSelect={setLast} />
      </Command>
      <Text variant="muted">{`Selected: ${last ?? 'none'}`}</Text>

      <View style={styles.row}>
        <Button variant="outline" onPress={() => setOpen(true)}>Open command dialog</Button>
      </View>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Palette onSelect={(value) => { setLast(value); setOpen(false); }} />
      </CommandDialog>

      <Command style={styles.inline}>
        <CommandInput placeholder="Search countries..." />
        <CommandList>
          <CommandEmpty>No country found.</CommandEmpty>
          {countries.map((name) => <CommandItem key={name} onSelect={setLast}>{name}</CommandItem>)}
        </CommandList>
      </Command>
    </Section>
  );
}

const styles = StyleSheet.create({
  inline: { borderWidth: 1, borderColor: '#e5e5e5' },
  row: { flexDirection: 'row', gap: 8 },
});
