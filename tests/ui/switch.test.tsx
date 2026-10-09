import { fireEvent, render, screen } from '@testing-library/react-native';
import { Switch } from '@/registry/marcn/ui/switch';

test('has switch role and reflects checked state', () => {
  render(<Switch checked />);
  expect(screen.getByRole('switch')).toBeChecked();
});

test('omitted checked is unchecked and toggles to true', () => {
  const onCheckedChange = jest.fn();
  render(<Switch onCheckedChange={onCheckedChange} />);
  expect(screen.getByRole('switch')).not.toBeChecked();
  fireEvent.press(screen.getByRole('switch'));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test('checked toggles to false', () => {
  const onCheckedChange = jest.fn();
  render(<Switch checked onCheckedChange={onCheckedChange} />);
  fireEvent.press(screen.getByRole('switch'));
  expect(onCheckedChange).toHaveBeenCalledWith(false);
});

test('disabled blocks press', () => {
  const onCheckedChange = jest.fn();
  render(<Switch disabled onCheckedChange={onCheckedChange} />);
  fireEvent.press(screen.getByRole('switch'));
  expect(onCheckedChange).not.toHaveBeenCalled();
  expect(screen.getByRole('switch')).toBeDisabled();
});

test('rerendering with a new checked value does not throw', () => {
  const { rerender } = render(<Switch checked={false} />);
  expect(() => rerender(<Switch checked />)).not.toThrow();
});
