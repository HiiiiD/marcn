import { render } from '@testing-library/react-native';
import { Icon } from '@/registry/marcn/ui/icon';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

const Fake = jest.fn((_props: Record<string, unknown>) => null);
beforeEach(() => Fake.mockClear());

test('passes default size and themed color', () => {
  render(<Icon icon={Fake as never} />);
  expect(Fake.mock.calls[0][0]).toMatchObject({ size: 16, color: lightColors.foreground });
});

test('uses dark foreground in dark mode', () => {
  setScheme('dark');
  render(<Icon icon={Fake as never} />);
  expect(Fake.mock.calls[0][0]).toMatchObject({ color: darkColors.foreground });
});

test('explicit size and color win', () => {
  render(<Icon icon={Fake as never} size={24} color="red" />);
  expect(Fake.mock.calls[0][0]).toMatchObject({ size: 24, color: 'red' });
});
