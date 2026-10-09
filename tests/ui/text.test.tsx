import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Text as RNText } from 'react-native';
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

test('render element keeps variant style and a11y props', () => {
  render(<Text variant="h1" render={<RNText testID="t" accessibilityLabel="mine" />}>Hi</Text>);
  const el = screen.getByTestId('t');
  expect(el).toHaveStyle({ fontSize: 36 });
  expect(el).toHaveProp('accessibilityLabel', 'mine');
  expect(screen.getByText('Hi')).toBeOnTheScreen();
});

test('render element still inherits TextStyleContext', () => {
  render(
    <TextStyleContext.Provider value={{ color: 'red' }}>
      <Text render={<RNText testID="t" />}>Hi</Text>
    </TextStyleContext.Provider>,
  );
  expect(screen.getByTestId('t')).toHaveStyle({ color: 'red' });
});

test('render function receives props', () => {
  const fn = jest.fn((props: object) => <RNText {...props} testID="t" />);
  render(<Text variant="muted" render={fn}>Hi</Text>);
  expect(fn).toHaveBeenCalledWith(expect.objectContaining({ children: 'Hi' }), {});
});

test('ref reaches the host, with and without render', () => {
  const plain = createRef<RNText>();
  const rendered = createRef<RNText>();
  render(<><Text ref={plain}>a</Text><Text ref={rendered} render={<RNText />}>b</Text></>);
  expect(plain.current).not.toBeNull();
  expect(rendered.current).not.toBeNull();
});
