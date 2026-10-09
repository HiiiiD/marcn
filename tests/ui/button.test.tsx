import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '@/registry/marcn/ui/button';
import { Text } from '@/registry/marcn/ui/text';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

test('renders a button role and fires onPress', () => {
  const onPress = jest.fn();
  render(<Button onPress={onPress}><Text>Go</Text></Button>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test.each([
  ['default', lightColors.primary],
  ['destructive', lightColors.destructive],
  ['secondary', lightColors.secondary],
  ['outline', lightColors.background],
] as const)('%s variant background', (variant, bg) => {
  render(<Button variant={variant}><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: bg });
});

test.each([['default', 36], ['sm', 32], ['lg', 40]] as const)('%s size height', (size, h) => {
  render(<Button size={size}><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ height: h });
});

test('icon size is square', () => {
  render(<Button size="icon"><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ height: 36, width: 36 });
});

test('child Text inherits variant text color', () => {
  render(<Button><Text>Go</Text></Button>);
  expect(screen.getByText('Go')).toHaveStyle({ color: lightColors.primaryForeground });
});

test('non-string children (icon + text) both render and text inherits style', () => {
  render(
    <Button variant="destructive">
      <Text>icon</Text>
      <Text>label</Text>
    </Button>,
  );
  expect(screen.getByText('label')).toHaveStyle({ color: lightColors.destructiveForeground });
});

test('disabled blocks press and reports state', () => {
  const onPress = jest.fn();
  render(<Button disabled onPress={onPress}><Text>x</Text></Button>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toBeDisabled();
});

test('dark mode swaps the default background', () => {
  setScheme('dark');
  render(<Button><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: darkColors.primary });
});

test('style prop overrides', () => {
  render(<Button style={{ marginTop: 9 }}><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ marginTop: 9 });
});
