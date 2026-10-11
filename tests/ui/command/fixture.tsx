import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, type CommandProps,
} from '@/registry/marcn/ui/command';

export function setup(props: Partial<CommandProps> = {}, onSelect = jest.fn()) {
  render(
    <Command {...props}>
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={onSelect}>Calendar</CommandItem>
          <CommandItem>Search Emoji</CommandItem>
          <CommandItem disabled onSelect={onSelect}>Calculator</CommandItem>
        </CommandGroup>
        <CommandSeparator testID="separator" />
        <CommandGroup heading="Settings">
          <CommandItem value="profile" keywords={['account']} onSelect={onSelect}>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>Billing</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  );
  return onSelect;
}

export const input = () => screen.getByPlaceholderText('Type a command...');
export const type = (text: string) => fireEvent.changeText(input(), text);
