import { render, screen } from '@testing-library/react-native';
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
