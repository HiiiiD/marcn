import { fireEvent, render, screen } from '@testing-library/react-native';
import { Input } from '@/registry/marcn/ui/input';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

test('renders placeholder and forwards text changes', () => {
  const onChangeText = jest.fn();
  render(<Input placeholder="Email" onChangeText={onChangeText} />);
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'a@b.c');
  expect(onChangeText).toHaveBeenCalledWith('a@b.c');
});

test('default border uses input token', () => {
  render(<Input placeholder="p" />);
  expect(screen.getByPlaceholderText('p')).toHaveStyle({ borderColor: lightColors.input });
});

test('focus swaps border to ring and calls the user handler', () => {
  const onFocus = jest.fn();
  render(<Input placeholder="p" onFocus={onFocus} />);
  fireEvent(screen.getByPlaceholderText('p'), 'focus');
  expect(onFocus).toHaveBeenCalled();
  expect(screen.getByPlaceholderText('p')).toHaveStyle({ borderColor: lightColors.ring });
  fireEvent(screen.getByPlaceholderText('p'), 'blur');
  expect(screen.getByPlaceholderText('p')).toHaveStyle({ borderColor: lightColors.input });
});

test('aria-invalid shows destructive border', () => {
  render(<Input placeholder="p" aria-invalid />);
  expect(screen.getByPlaceholderText('p')).toHaveStyle({ borderColor: lightColors.destructive });
});

test('disabled is not editable and dimmed', () => {
  render(<Input placeholder="p" disabled />);
  const el = screen.getByPlaceholderText('p');
  expect(el.props.editable).toBe(false);
  expect(el).toHaveStyle({ opacity: 0.5 });
});

test('dark mode swaps text color', () => {
  setScheme('dark');
  render(<Input placeholder="p" />);
  expect(screen.getByPlaceholderText('p')).toHaveStyle({ color: darkColors.foreground });
});

test('reports disabled accessibility state', () => {
  const { rerender } = render(<Input placeholder="p" disabled />);
  expect(screen.getByPlaceholderText('p').props.accessibilityState).toEqual({ disabled: true });
  rerender(<Input placeholder="p" />);
  expect(screen.getByPlaceholderText('p').props.accessibilityState).toEqual({ disabled: false });
});
