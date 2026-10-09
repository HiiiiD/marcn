import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { Badge } from '@/registry/marcn/ui/badge';
import { Text } from '@/registry/marcn/ui/text';
import { lightColors } from '@/registry/marcn/lib/theme';

test.each([
  ['default', lightColors.primary, lightColors.primaryForeground],
  ['secondary', lightColors.secondary, lightColors.secondaryForeground],
  ['destructive', lightColors.destructive, lightColors.destructiveForeground],
] as const)('%s variant', (variant, bg, fg) => {
  render(<Badge variant={variant} testID="b"><Text>tag</Text></Badge>);
  expect(screen.getByTestId('b')).toHaveStyle({ backgroundColor: bg });
  expect(screen.getByText('tag')).toHaveStyle({ color: fg });
});

test('outline has a border and foreground text', () => {
  render(<Badge variant="outline" testID="b"><Text>tag</Text></Badge>);
  expect(screen.getByTestId('b')).toHaveStyle({ borderWidth: 1, borderColor: lightColors.border });
  expect(screen.getByText('tag')).toHaveStyle({ color: lightColors.foreground });
});

test('is pill shaped', () => {
  render(<Badge testID="b"><Text>x</Text></Badge>);
  expect(screen.getByTestId('b')).toHaveStyle({ borderRadius: 9999 });
});

test('plain string children are wrapped in Text with the variant color', () => {
  render(<Badge>New</Badge>);
  expect(screen.getByText('New')).toHaveStyle({ color: lightColors.primaryForeground });
});

test('render element keeps variant style and text inheritance', () => {
  render(<Badge variant="destructive" render={<View testID="b" />}>tag</Badge>);
  expect(screen.getByTestId('b')).toHaveStyle({ backgroundColor: lightColors.destructive, borderRadius: 9999 });
  expect(screen.getByText('tag')).toHaveStyle({ color: lightColors.destructiveForeground });
});

test('render function receives view props', () => {
  const fn = jest.fn((props: object) => <View {...props} testID="b" />);
  render(<Badge render={fn}>tag</Badge>);
  expect(fn).toHaveBeenCalledWith(expect.objectContaining({ children: expect.anything() }), {});
});
