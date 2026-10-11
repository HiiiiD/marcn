import { useEffect } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/registry/marcn/ui/command';
import { setup, type as typeText } from './fixture';

const typeQ = (text: string) => fireEvent.changeText(screen.getByPlaceholderText('q'), text);

test('a stronger match renders above a weaker one declared before it', () => {
  render(
    <Command>
      <CommandInput placeholder="q" />
      <CommandList>
        <CommandItem>Search Calendar</CommandItem>
        <CommandItem>Calendar</CommandItem>
      </CommandList>
    </Command>,
  );
  typeQ('cal');
  const rows = screen.getAllByRole('menuitem');
  expect(rows[0]).toHaveTextContent('Calendar');
  expect(rows[1]).toHaveTextContent('Search Calendar');
});

test('groups are ordered by their best item', () => {
  render(
    <Command>
      <CommandInput placeholder="q" />
      <CommandList>
        <CommandGroup heading="Weak"><CommandItem>Search Calendar</CommandItem></CommandGroup>
        <CommandGroup heading="Strong"><CommandItem>Calendar</CommandItem></CommandGroup>
      </CommandList>
    </Command>,
  );
  typeQ('cal');
  expect(screen.getAllByText(/^(Weak|Strong)$/).map((node) => node.props.children)).toEqual(['Strong', 'Weak']);
});

test('items added while a search is active appear, and the empty state follows removals', () => {
  const tree = (items: string[]) => (
    <Command defaultValue="cal">
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Results">
          {items.map((name) => <CommandItem key={name}>{name}</CommandItem>)}
        </CommandGroup>
      </CommandList>
    </Command>
  );
  const { rerender } = render(tree([]));
  expect(screen.getByText('No results.')).toBeOnTheScreen();
  expect(screen.queryByText('Results')).toBeNull();
  rerender(tree(['Calendar']));
  expect(screen.queryByText('No results.')).toBeNull();
  expect(screen.getByText('Results')).toBeOnTheScreen();
  rerender(tree([]));
  expect(screen.getByText('No results.')).toBeOnTheScreen();
});

test('a whitespace-only search shows everything in declared order', () => {
  setup();
  typeText('   ');
  expect(screen.getAllByRole('menuitem')).toHaveLength(5);
});

test('starting and clearing a search keeps matching rows mounted', () => {
  let mounts = 0;
  const Probe = () => {
    useEffect(() => { mounts += 1; }, []);
    return null;
  };
  render(
    <Command>
      <CommandInput placeholder="q" />
      <CommandList>
        <CommandItem>Calendar<Probe /></CommandItem>
        <CommandItem>Billing</CommandItem>
      </CommandList>
    </Command>,
  );
  expect(mounts).toBe(1);
  typeQ('cal');
  typeQ('');
  expect(mounts).toBe(1);
});

test('a group with no items of its own stays visible until a search is typed', () => {
  render(
    <Command>
      <CommandInput placeholder="q" />
      <CommandList>
        <CommandGroup heading="Custom"><Text>Custom row</Text></CommandGroup>
        <CommandItem>Calendar</CommandItem>
      </CommandList>
    </Command>,
  );
  expect(screen.getByText('Custom row')).toBeVisible();
  typeQ('cal');
  expect(screen.queryByText('Custom row')).toBeNull();
});
