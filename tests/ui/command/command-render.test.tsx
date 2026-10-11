import { createRef } from 'react';
import { Pressable, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Command, CommandGroup, CommandItem, CommandList } from '@/registry/marcn/ui/command';

test('Command accepts an element render prop', () => {
  render(<Command render={<View testID="host" />}><CommandList><CommandItem>A</CommandItem></CommandList></Command>);
  expect(screen.getByTestId('host')).toBeOnTheScreen();
  expect(screen.getByText('A')).toBeOnTheScreen();
});

test('Command accepts a function render prop and forwards its ref to the host', () => {
  const ref = createRef<View>();
  render(
    <Command ref={ref} render={(props) => <View {...props} testID="fn" />}>
      <CommandItem>A</CommandItem>
    </Command>,
  );
  expect(screen.getByTestId('fn')).toBeOnTheScreen();
  expect(ref.current).not.toBeNull();
});

test('CommandItem accepts render and keeps its role', () => {
  render(<Command><CommandItem render={<Pressable testID="row" />}>A</CommandItem></Command>);
  expect(screen.getByTestId('row').props.role).toBe('menuitem');
});

test('CommandGroup labels itself from a string heading', () => {
  render(<Command><CommandGroup heading="Settings"><CommandItem>A</CommandItem></CommandGroup></Command>);
  expect(screen.getByLabelText('Settings').props.role).toBe('group');
});
