import { fireEvent, render, screen } from '@testing-library/react-native';
import { Checkbox } from '@/registry/marcn/ui/checkbox';
import { lightColors } from '@/registry/marcn/lib/theme';

test('has checkbox role, unchecked by default', () => {
  render(<Checkbox />);
  expect(screen.getByRole('checkbox')).not.toBeChecked();
});

test('omitted checked toggles to true', () => {
  const onCheckedChange = jest.fn();
  render(<Checkbox onCheckedChange={onCheckedChange} />);
  fireEvent.press(screen.getByRole('checkbox'));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test('checked toggles to false and is filled with primary', () => {
  const onCheckedChange = jest.fn();
  render(<Checkbox checked onCheckedChange={onCheckedChange} />);
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(screen.getByRole('checkbox')).toHaveStyle({ backgroundColor: lightColors.primary });
  fireEvent.press(screen.getByRole('checkbox'));
  expect(onCheckedChange).toHaveBeenCalledWith(false);
});

test('indeterminate is mixed and toggles to true', () => {
  const onCheckedChange = jest.fn();
  render(<Checkbox checked="indeterminate" onCheckedChange={onCheckedChange} />);
  expect(screen.getByRole('checkbox')).toBePartiallyChecked();
  fireEvent.press(screen.getByRole('checkbox'));
  expect(onCheckedChange).toHaveBeenCalledWith(true);
});

test('disabled blocks press', () => {
  const onCheckedChange = jest.fn();
  render(<Checkbox disabled onCheckedChange={onCheckedChange} />);
  fireEvent.press(screen.getByRole('checkbox'));
  expect(onCheckedChange).not.toHaveBeenCalled();
});

test('has a default hitSlop that callers can override', () => {
  const { rerender } = render(<Checkbox />);
  expect(screen.getByRole('checkbox').props.hitSlop).toEqual(expect.any(Number));
  rerender(<Checkbox hitSlop={5} />);
  expect(screen.getByRole('checkbox').props.hitSlop).toBe(5);
});
