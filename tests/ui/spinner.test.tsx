import { render, screen } from '@testing-library/react-native';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { Spinner } from '@/registry/marcn/ui/spinner';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

jest.mock('lucide-react-native', () => ({
  Loader2: jest.fn((_props: Record<string, unknown>) => null),
}));

const { Loader2 } = jest.requireMock('lucide-react-native') as { Loader2: jest.Mock };
beforeEach(() => Loader2.mockClear());

test('is a progressbar labelled Loading by default', () => {
  render(<Spinner />);
  expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeOnTheScreen();
});

test('label can be overridden', () => {
  render(<Spinner accessibilityLabel="Saving" />);
  expect(screen.getByLabelText('Saving')).toBeOnTheScreen();
});

test('defaults to 16px themed foreground icon', () => {
  render(<Spinner />);
  expect(Loader2.mock.calls[0][0]).toMatchObject({ size: 16, color: lightColors.foreground });
});

test('dark mode swaps foreground', () => {
  setScheme('dark');
  render(<Spinner />);
  expect(Loader2.mock.calls[0][0]).toMatchObject({ color: darkColors.foreground });
});

test('size and color props reach the icon', () => {
  render(<Spinner size={24} color="red" />);
  expect(Loader2.mock.calls[0][0]).toMatchObject({ size: 24, color: 'red' });
});

test('inherits color from TextStyleContext', () => {
  render(
    <TextStyleContext.Provider value={{ color: 'blue' }}>
      <Spinner />
    </TextStyleContext.Provider>,
  );
  expect(Loader2.mock.calls[0][0]).toMatchObject({ color: 'blue' });
});

test('explicit color beats inherited color', () => {
  render(
    <TextStyleContext.Provider value={{ color: 'blue' }}>
      <Spinner color="red" />
    </TextStyleContext.Provider>,
  );
  expect(Loader2.mock.calls[0][0]).toMatchObject({ color: 'red' });
});

test('merges style and spreads props last', () => {
  render(<Spinner testID="s" style={{ margin: 3 }} />);
  expect(screen.getByTestId('s')).toHaveStyle({ margin: 3 });
});

test('unmounts without error', () => {
  const { unmount } = render(<><Spinner /><Text>x</Text></>);
  expect(() => unmount()).not.toThrow();
});
