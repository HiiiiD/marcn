import { render, screen } from '@testing-library/react-native';
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
