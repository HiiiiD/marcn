import { render, screen } from '@testing-library/react-native';
import { Skeleton } from '@/registry/marcn/ui/skeleton';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

test('renders with accent background and rounded corners', () => {
  render(<Skeleton testID="s" style={{ height: 20 }} />);
  expect(screen.getByTestId('s')).toHaveStyle({ backgroundColor: lightColors.accent, borderRadius: 8, height: 20 });
});

test('dark mode swaps background', () => {
  setScheme('dark');
  render(<Skeleton testID="s" />);
  expect(screen.getByTestId('s')).toHaveStyle({ backgroundColor: darkColors.accent });
});

test('unmounts without error', () => {
  const { unmount } = render(<Skeleton />);
  expect(() => unmount()).not.toThrow();
});
