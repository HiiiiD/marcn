import { fireEvent, render, screen } from '@testing-library/react-native';
import { Avatar, AvatarFallback, AvatarImage } from '@/registry/marcn/ui/avatar';
import { Text } from '@/registry/marcn/ui/text';

const Example = ({ uri }: { uri: string }) => (
  <Avatar>
    <AvatarImage testID="img" source={{ uri }} />
    <AvatarFallback><Text>MS</Text></AvatarFallback>
  </Avatar>
);

test('is a circle with the given size', () => {
  render(<Avatar testID="a" size={48} />);
  expect(screen.getByTestId('a')).toHaveStyle({ width: 48, height: 48, borderRadius: 24 });
});

test('shows the fallback while the image loads', () => {
  render(<Example uri="a.png" />);
  expect(screen.getByText('MS')).toBeOnTheScreen();
});

test('hides the fallback after the image loads', () => {
  render(<Example uri="a.png" />);
  fireEvent(screen.getByTestId('img'), 'load');
  expect(screen.queryByText('MS')).toBeNull();
});

test('on error the image is removed and the fallback stays', () => {
  render(<Example uri="a.png" />);
  fireEvent(screen.getByTestId('img'), 'error');
  expect(screen.queryByTestId('img')).toBeNull();
  expect(screen.getByText('MS')).toBeOnTheScreen();
});

test('changing the source after an error retries and shows the fallback until loaded', () => {
  const { rerender } = render(<Example uri="bad.png" />);
  fireEvent(screen.getByTestId('img'), 'error');
  rerender(<Example uri="good.png" />);
  expect(screen.getByTestId('img')).toBeOnTheScreen();
  expect(screen.getByText('MS')).toBeOnTheScreen();
  fireEvent(screen.getByTestId('img'), 'load');
  expect(screen.queryByText('MS')).toBeNull();
});
