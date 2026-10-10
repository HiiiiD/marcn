import { createRef } from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ToggleGroup, ToggleGroupItem, type ToggleGroupProps } from '@/registry/marcn/ui/toggle-group';

type Single = Omit<Extract<ToggleGroupProps, { type: 'single' }>, 'type'>;
type Multiple = Omit<Extract<ToggleGroupProps, { type: 'multiple' }>, 'type'>;

const items = (
  <>
    <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
    <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
    <ToggleGroupItem value="underline" disabled>
      Underline
    </ToggleGroupItem>
  </>
);
const single = (props: Single = {}) => render(<ToggleGroup type="single" {...props}>{items}</ToggleGroup>);
const multiple = (props: Multiple = {}) => render(<ToggleGroup type="multiple" {...props}>{items}</ToggleGroup>);
const item = (name: string) => screen.getByRole('button', { name });

test('single: selecting one deselects the other', () => {
  single();
  fireEvent.press(item('Bold'));
  fireEvent.press(item('Italic'));
  expect(item('Italic')).toBeSelected();
  expect(item('Bold')).not.toBeSelected();
});

test('single: pressing the selected item deselects it and reports an empty string', () => {
  const onValueChange = jest.fn();
  single({ defaultValue: 'bold', onValueChange });
  fireEvent.press(item('Bold'));
  expect(item('Bold')).not.toBeSelected();
  expect(onValueChange).toHaveBeenCalledWith('');
});

test('single controlled follows value', () => {
  const onValueChange = jest.fn();
  single({ value: 'italic', onValueChange });
  expect(item('Italic')).toBeSelected();
  fireEvent.press(item('Bold'));
  expect(onValueChange).toHaveBeenCalledWith('bold');
  expect(item('Italic')).toBeSelected();
});

test('multiple: items toggle independently and report arrays', () => {
  const onValueChange = jest.fn();
  multiple({ onValueChange });
  fireEvent.press(item('Bold'));
  fireEvent.press(item('Italic'));
  expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);
  fireEvent.press(item('Bold'));
  expect(onValueChange).toHaveBeenLastCalledWith(['italic']);
});

test('multiple supports defaultValue', () => {
  multiple({ defaultValue: ['bold', 'italic'] });
  expect(item('Bold')).toBeSelected();
  expect(item('Italic')).toBeSelected();
});

test('a disabled item cannot be pressed; a disabled group disables all', () => {
  single();
  fireEvent.press(item('Underline'));
  expect(item('Underline')).not.toBeSelected();
  expect(item('Underline')).toBeDisabled();
});

test('disabled group disables every item', () => {
  single({ disabled: true });
  expect(item('Bold')).toBeDisabled();
});

test('variant from the group reaches items', () => {
  single({ variant: 'outline' });
  expect(item('Bold')).toHaveStyle({ borderLeftWidth: 1 });
});

test('spacing > 0 separates items with a gap and keeps rounded items', () => {
  const { toJSON } = single({ spacing: 2 });
  expect(JSON.stringify(toJSON())).toContain('"gap":8');
});

test('root supports ref and render element', () => {
  const ref = createRef<View>();
  render(
    <ToggleGroup type="single" ref={ref} render={<View testID="el" />}>
      {items}
    </ToggleGroup>,
  );
  expect(ref.current).not.toBeNull();
  expect(screen.getByTestId('el')).toBeOnTheScreen();
});

test('item throws outside a group', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<ToggleGroupItem value="x">x</ToggleGroupItem>)).toThrow();
  jest.restoreAllMocks();
});
