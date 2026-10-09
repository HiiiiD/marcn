import { render, screen } from '@testing-library/react-native';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

test('default text uses foreground color', () => {
  render(<Text>hi</Text>);
  expect(screen.getByText('hi')).toHaveStyle({ color: lightColors.foreground });
});

test('dark mode swaps color', () => {
  setScheme('dark');
  render(<Text>hi</Text>);
  expect(screen.getByText('hi')).toHaveStyle({ color: darkColors.foreground });
});

test('variant applies its style', () => {
  render(<Text variant="h1">title</Text>);
  expect(screen.getByText('title')).toHaveStyle({ fontSize: 36 });
});

test('muted variant uses mutedForeground', () => {
  render(<Text variant="muted">m</Text>);
  expect(screen.getByText('m')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('context style overrides base, style prop overrides context', () => {
  render(
    <TextStyleContext.Provider value={{ color: 'red', fontSize: 11 }}>
      <Text>ctx</Text>
      <Text style={{ color: 'blue' }}>own</Text>
    </TextStyleContext.Provider>,
  );
  expect(screen.getByText('ctx')).toHaveStyle({ color: 'red', fontSize: 11 });
  expect(screen.getByText('own')).toHaveStyle({ color: 'blue', fontSize: 11 });
});
