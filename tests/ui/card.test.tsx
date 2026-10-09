import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/registry/marcn/ui/card';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

function Example() {
  return (
    <Card testID="card">
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Desc</CardDescription>
      </CardHeader>
      <CardContent testID="content" />
      <CardFooter testID="footer" />
    </Card>
  );
}

test('renders all parts', () => {
  render(<Example />);
  expect(screen.getByText('Title')).toBeOnTheScreen();
  expect(screen.getByText('Desc')).toBeOnTheScreen();
  expect(screen.getByTestId('content')).toBeOnTheScreen();
  expect(screen.getByTestId('footer')).toBeOnTheScreen();
});

test('card surface uses card color and border', () => {
  render(<Example />);
  expect(screen.getByTestId('card')).toHaveStyle({ backgroundColor: lightColors.card, borderColor: lightColors.border, borderWidth: 1 });
});

test('dark mode swaps card surface', () => {
  setScheme('dark');
  render(<Example />);
  expect(screen.getByTestId('card')).toHaveStyle({ backgroundColor: darkColors.card });
});

test('title is semibold and description is muted', () => {
  render(<Example />);
  expect(screen.getByText('Title')).toHaveStyle({ fontWeight: '600' });
  expect(screen.getByText('Desc')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('footer lays out in a row', () => {
  render(<Example />);
  expect(screen.getByTestId('footer')).toHaveStyle({ flexDirection: 'row' });
});

test('Card render element keeps surface style', () => {
  render(<Card render={<View testID="c" />} />);
  expect(screen.getByTestId('c')).toHaveStyle({ backgroundColor: lightColors.card, borderWidth: 1 });
});

test('Card renders an Animated.View', () => {
  render(<Card render={<Animated.View testID="c" />} />);
  expect(screen.getByTestId('c')).toHaveStyle({ backgroundColor: lightColors.card });
});

test('Card render function receives props', () => {
  const fn = jest.fn((props: object) => <View {...props} testID="c" />);
  render(<Card render={fn} />);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('Card ref reaches the host, with and without render', () => {
  const plain = createRef<View>();
  const rendered = createRef<View>();
  render(<><Card ref={plain} /><Card ref={rendered} render={<View />} /></>);
  expect(plain.current).not.toBeNull();
  expect(rendered.current).not.toBeNull();
});
