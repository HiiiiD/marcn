import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { View } from 'react-native';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/registry/marcn/ui/empty';
import { lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';
import { darkColors } from '@/registry/marcn/lib/theme';

function Example() {
  return (
    <Empty testID="empty">
      <EmptyHeader testID="header">
        <EmptyMedia testID="media" variant="icon" />
        <EmptyTitle>No projects</EmptyTitle>
        <EmptyDescription>Create one to start.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent testID="content" />
    </Empty>
  );
}

test('renders all parts', () => {
  render(<Example />);
  expect(screen.getByText('No projects')).toBeOnTheScreen();
  expect(screen.getByText('Create one to start.')).toBeOnTheScreen();
  expect(screen.getByTestId('content')).toBeOnTheScreen();
});

test('root is a centered dashed column filling its parent', () => {
  render(<Example />);
  expect(screen.getByTestId('empty')).toHaveStyle({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 24,
    borderRadius: 10,
    borderStyle: 'dashed',
  });
});

test('header is a narrow centered column', () => {
  render(<Example />);
  expect(screen.getByTestId('header')).toHaveStyle({ maxWidth: 384, alignItems: 'center', gap: 8 });
});

test('icon media is a 40px muted tile', () => {
  render(<Example />);
  expect(screen.getByTestId('media')).toHaveStyle({ width: 40, height: 40, borderRadius: 10, backgroundColor: lightColors.muted });
});

test('default media is transparent', () => {
  render(<EmptyMedia testID="m" />);
  expect(screen.getByTestId('m')).toHaveStyle({ backgroundColor: 'transparent' });
});

test('dark mode swaps icon media and description colors', () => {
  setScheme('dark');
  render(<Example />);
  expect(screen.getByTestId('media')).toHaveStyle({ backgroundColor: darkColors.muted });
  expect(screen.getByText('Create one to start.')).toHaveStyle({ color: darkColors.mutedForeground });
});

test('title is a header, large and medium weight', () => {
  render(<Example />);
  expect(screen.getByRole('header', { name: 'No projects' })).toHaveStyle({ fontSize: 18, fontWeight: '500' });
});

test('description is muted and small', () => {
  render(<Example />);
  expect(screen.getByText('Create one to start.')).toHaveStyle({ fontSize: 14, color: lightColors.mutedForeground });
});

test('content is a narrow centered column', () => {
  render(<Example />);
  expect(screen.getByTestId('content')).toHaveStyle({ maxWidth: 384, width: '100%', alignItems: 'center', gap: 16 });
});

test('caller style wins', () => {
  render(<Empty testID="e" style={{ borderWidth: 1 }} />);
  expect(screen.getByTestId('e')).toHaveStyle({ borderWidth: 1, borderStyle: 'dashed' });
});

test('render element keeps styles and ref reaches host', () => {
  const ref = createRef<View>();
  render(<Empty ref={ref} render={<View testID="r" />} />);
  expect(screen.getByTestId('r')).toHaveStyle({ gap: 24 });
  expect(ref.current).not.toBeNull();
});

test('render function receives props', () => {
  const fn = jest.fn((props: object) => <View {...props} testID="r" />);
  render(<Empty render={fn} />);
  expect(fn).toHaveBeenCalledTimes(1);
});
