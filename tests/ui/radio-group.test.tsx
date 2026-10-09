import { fireEvent, render, screen } from '@testing-library/react-native';
import { RadioGroup, RadioGroupItem } from '@/registry/marcn/ui/radio-group';

const Example = (props: { value?: string; onValueChange?: (v: string) => void; disabled?: boolean }) => (
  <RadioGroup {...props}>
    <RadioGroupItem value="a" accessibilityLabel="A" />
    <RadioGroupItem value="b" accessibilityLabel="B" />
  </RadioGroup>
);

test('has radiogroup and radio roles', () => {
  render(<Example value="a" />);
  const group = screen.UNSAFE_getByProps({ accessibilityRole: 'radiogroup' });
  expect(group.props.accessible).not.toBe(true);
  expect(screen.getAllByRole('radio')).toHaveLength(2);
});

test('selected item is checked, others are not', () => {
  render(<Example value="a" />);
  expect(screen.getByLabelText('A')).toBeChecked();
  expect(screen.getByLabelText('B')).not.toBeChecked();
});

test('pressing an item reports its value', () => {
  const onValueChange = jest.fn();
  render(<Example value="a" onValueChange={onValueChange} />);
  fireEvent.press(screen.getByLabelText('B'));
  expect(onValueChange).toHaveBeenCalledWith('b');
});

test('disabled group blocks selection', () => {
  const onValueChange = jest.fn();
  render(<Example value="a" disabled onValueChange={onValueChange} />);
  fireEvent.press(screen.getByLabelText('B'));
  expect(onValueChange).not.toHaveBeenCalled();
});

test('item outside a group throws a clear error', () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<RadioGroupItem value="x" />)).toThrow('RadioGroupItem must be used within a RadioGroup');
  consoleError.mockRestore();
});

test('items have a default hitSlop that callers can override', () => {
  const { unmount } = render(<Example value="a" />);
  expect(screen.getByLabelText('A').props.hitSlop).toEqual(expect.any(Number));
  unmount();
  render(
    <RadioGroup value="a">
      <RadioGroupItem value="a" accessibilityLabel="A" hitSlop={5} />
    </RadioGroup>,
  );
  expect(screen.getByLabelText('A').props.hitSlop).toBe(5);
});
