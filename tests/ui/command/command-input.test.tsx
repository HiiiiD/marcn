import { render, screen, fireEvent } from '@testing-library/react-native';
import { Command, CommandInput, CommandItem, CommandList } from '@/registry/marcn/ui/command';
import { input, setup, type as typeText } from './fixture';

const submit = () => fireEvent(input(), 'submitEditing');

test('the input is a labelled search box with keyboard-friendly defaults', () => {
  setup();
  expect(input().props.role).toBe('searchbox');
  expect(input().props.accessibilityLabel).toBe('Type a command...');
  expect(input().props.returnKeyType).toBe('search');
  expect(input().props.autoCorrect).toBe(false);
  expect(input().props.autoCapitalize).toBe('none');
});

test('typing reports through onChangeText and onValueChange', () => {
  const onValueChange = jest.fn((_: string) => {});
  const onChangeText = jest.fn((_: string) => {});
  render(
    <Command onValueChange={onValueChange}>
      <CommandInput placeholder="q" onChangeText={onChangeText} />
    </Command>,
  );
  fireEvent.changeText(screen.getByPlaceholderText('q'), 'abc');
  expect(onValueChange).toHaveBeenCalledWith('abc');
  expect(onChangeText).toHaveBeenCalledWith('abc');
});

test('submit runs the best match', () => {
  const onSelect = setup();
  typeText('cal');
  submit();
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith('Calendar');
});

test('submit skips a disabled best match and does nothing without a search', () => {
  const onSelect = setup();
  submit();
  expect(onSelect).not.toHaveBeenCalled();
  typeText('calculator');
  submit();
  expect(onSelect).not.toHaveBeenCalled();
});

test('the best match is highlighted while searching only', () => {
  setup();
  const accent = '#f5f5f5';
  expect(screen.getAllByRole('menuitem')[0]).not.toHaveStyle({ backgroundColor: accent });
  typeText('cal');
  expect(screen.getAllByRole('menuitem')[0]).toHaveStyle({ backgroundColor: accent });
});

test('a custom filter that returns 0 for everything leaves submit inert', () => {
  const onSelect = jest.fn();
  render(
    <Command filter={() => 0}>
      <CommandInput placeholder="q" />
      <CommandList><CommandItem onSelect={onSelect}>Calendar</CommandItem></CommandList>
    </Command>,
  );
  fireEvent.changeText(screen.getByPlaceholderText('q'), 'x');
  fireEvent(screen.getByPlaceholderText('q'), 'submitEditing');
  expect(onSelect).not.toHaveBeenCalled();
});
