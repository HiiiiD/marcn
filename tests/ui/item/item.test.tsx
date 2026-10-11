import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Pressable, View } from 'react-native';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/registry/marcn/ui/item';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../../scheme';

function Example() {
  return (
    <ItemGroup testID="group">
      <Item testID="item">
        <ItemMedia testID="media" variant="icon" />
        <ItemContent testID="content">
          <ItemTitle>Title</ItemTitle>
          <ItemDescription>Description</ItemDescription>
        </ItemContent>
        <ItemActions testID="actions" />
      </Item>
      <ItemSeparator testID="sep" />
    </ItemGroup>
  );
}

test('renders all parts', () => {
  render(<Example />);
  expect(screen.getByText('Title')).toBeOnTheScreen();
  expect(screen.getByText('Description')).toBeOnTheScreen();
  expect(screen.getByTestId('actions')).toBeOnTheScreen();
  expect(screen.getByTestId('sep', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('group has list role', () => {
  render(<Example />);
  expect(screen.getByTestId('group')).toHaveProp('accessibilityRole', 'list');
});

test('default item is a wrapping row with transparent border', () => {
  render(<Example />);
  expect(screen.getByTestId('item')).toHaveStyle({
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    gap: 16,
    padding: 16,
  });
});

test('outline variant shows border color', () => {
  render(<Item testID="i" variant="outline" />);
  expect(screen.getByTestId('i')).toHaveStyle({ borderColor: lightColors.border });
});

test('muted variant uses half-opacity muted background', () => {
  render(<Item testID="i" variant="muted" />);
  expect(screen.getByTestId('i')).toHaveStyle({ backgroundColor: `${lightColors.muted}80` });
});

test('dark mode swaps muted background', () => {
  setScheme('dark');
  render(<Item testID="i" variant="muted" />);
  expect(screen.getByTestId('i')).toHaveStyle({ backgroundColor: `${darkColors.muted}80` });
});

test('sm size tightens gap and padding', () => {
  render(<Item testID="i" size="sm" />);
  expect(screen.getByTestId('i')).toHaveStyle({ gap: 10, paddingHorizontal: 16, paddingVertical: 12 });
});

test('icon media is a 32px bordered muted tile', () => {
  render(<Example />);
  expect(screen.getByTestId('media')).toHaveStyle({
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: lightColors.border,
    backgroundColor: lightColors.muted,
  });
});

test('image media is a clipped 40px square', () => {
  render(<ItemMedia testID="m" variant="image" />);
  expect(screen.getByTestId('m')).toHaveStyle({ width: 40, height: 40, borderRadius: 6, overflow: 'hidden' });
});

test('content grows and stacks', () => {
  render(<Example />);
  expect(screen.getByTestId('content')).toHaveStyle({ flex: 1, gap: 4 });
});

test('title is medium small text', () => {
  render(<Example />);
  expect(screen.getByText('Title')).toHaveStyle({ fontSize: 14, fontWeight: '500' });
});

test('description is muted and clamped to two lines', () => {
  render(<Example />);
  const d = screen.getByText('Description');
  expect(d).toHaveStyle({ fontSize: 14, color: lightColors.mutedForeground });
  expect(d.props.numberOfLines).toBe(2);
});

test('actions row has gap', () => {
  render(<Example />);
  expect(screen.getByTestId('actions')).toHaveStyle({ flexDirection: 'row', alignItems: 'center', gap: 8 });
});

test('header and footer span the full row', () => {
  render(<><ItemHeader testID="h" /><ItemFooter testID="f" /></>);
  for (const id of ['h', 'f']) {
    expect(screen.getByTestId(id)).toHaveStyle({ flexBasis: '100%', justifyContent: 'space-between', flexDirection: 'row' });
  }
});

test('render element keeps styles and ref reaches host', () => {
  const ref = createRef<View>();
  render(<Item ref={ref} render={<Pressable testID="p" />} />);
  expect(screen.getByTestId('p')).toHaveStyle({ flexDirection: 'row', borderRadius: 8 });
  expect(ref.current).not.toBeNull();
});

test('render function receives props', () => {
  const fn = jest.fn((props: object) => <View {...props} testID="r" />);
  render(<Item render={fn} />);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('caller style wins', () => {
  render(<Item testID="i" style={{ padding: 2 }} />);
  expect(screen.getByTestId('i')).toHaveStyle({ padding: 2 });
});
