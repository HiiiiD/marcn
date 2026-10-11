import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { View } from 'react-native';
import { AspectRatio } from '@/registry/marcn/ui/aspect-ratio';

test('defaults to a square at full width', () => {
  render(<AspectRatio testID="a" />);
  expect(screen.getByTestId('a')).toHaveStyle({ width: '100%', aspectRatio: 1 });
});

test('applies ratio and lets style override', () => {
  render(<AspectRatio testID="a" ratio={16 / 9} style={{ width: 200 }} />);
  expect(screen.getByTestId('a')).toHaveStyle({ width: 200, aspectRatio: 16 / 9 });
});

test('render element keeps ratio style', () => {
  render(<AspectRatio ratio={2} render={<View testID="custom" />} />);
  expect(screen.getByTestId('custom')).toHaveStyle({ aspectRatio: 2 });
});

test('render function receives props', () => {
  render(<AspectRatio ratio={2} render={(props) => <View testID="fn" {...props} />} />);
  expect(screen.getByTestId('fn')).toHaveStyle({ aspectRatio: 2 });
});

test('ref reaches the host view', () => {
  const ref = createRef<View>();
  render(<AspectRatio ref={ref} />);
  expect(ref.current).not.toBeNull();
});
