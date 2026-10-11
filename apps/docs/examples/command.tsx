import { useState } from 'react';
import { View } from 'react-native';
import { Calendar, CreditCard, Settings, Smile } from 'lucide-react-native';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/lib/theme';

export default function Example() {
  const { colors } = useTheme();
  const [last, setLast] = useState<string | null>(null);
  return (
    <View style={{ gap: 8 }}>
      <Command style={{ borderWidth: 1, borderColor: colors.border }}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={setLast}><Icon icon={Calendar} />Calendar</CommandItem>
            <CommandItem onSelect={setLast}><Icon icon={Smile} />Search Emoji</CommandItem>
            <CommandItem disabled onSelect={setLast}>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem value="billing" onSelect={setLast}>
              <Icon icon={CreditCard} />Billing<CommandShortcut>Plan</CommandShortcut>
            </CommandItem>
            <CommandItem value="settings" onSelect={setLast}>
              <Icon icon={Settings} />Settings<CommandShortcut>App</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <Text variant="muted">{`Selected: ${last ?? 'none'}`}</Text>
    </View>
  );
}
