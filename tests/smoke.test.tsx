import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

test('jest renders react native', () => {
  render(<Text>hello</Text>);
  expect(screen.getByText('hello')).toBeOnTheScreen();
});
