import { fireEvent, render, screen } from '@testing-library/react-native';
import { ChevronRight } from 'lucide-react-native';
import { createRef } from 'react';
import { I18nManager, Pressable, Text as RNText, View, type PressableProps } from 'react-native';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbLinkState,
} from '@/registry/marcn/ui/breadcrumb';
import { Text } from '@/registry/marcn/ui/text';
import { lightColors } from '@/registry/marcn/lib/theme';

const hidden = { includeHiddenElements: true };

test('Breadcrumb is a labelled navigation landmark', () => {
  render(<Breadcrumb />);
  expect(screen.getByLabelText('breadcrumb')).toBeOnTheScreen();
});

test('List wraps and items are rows', () => {
  render(
    <BreadcrumbList testID="list">
      <BreadcrumbItem testID="item" />
    </BreadcrumbList>,
  );
  expect(screen.getByTestId('list')).toHaveStyle({ flexDirection: 'row', flexWrap: 'wrap' });
  expect(screen.getByTestId('item')).toHaveStyle({ flexDirection: 'row' });
});

test('link is a link role, wraps strings in muted text and fires onPress', () => {
  const onPress = jest.fn();
  render(<BreadcrumbLink onPress={onPress}>Home</BreadcrumbLink>);
  fireEvent.press(screen.getByRole('link'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Home')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('link text turns foreground while pressed', () => {
  render(<BreadcrumbLink>Home</BreadcrumbLink>);
  fireEvent(screen.getByRole('link'), 'pressIn');
  expect(screen.getByText('Home')).toHaveStyle({ color: lightColors.foreground });
  fireEvent(screen.getByRole('link'), 'pressOut');
  expect(screen.getByText('Home')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('non-string children inherit the link text style', () => {
  render(
    <BreadcrumbLink>
      <Text>Docs</Text>
    </BreadcrumbLink>,
  );
  expect(screen.getByText('Docs')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('render element keeps the role and onPress', () => {
  const onPress = jest.fn();
  render(
    <BreadcrumbLink onPress={onPress} render={<Pressable testID="el" />}>
      Home
    </BreadcrumbLink>,
  );
  fireEvent.press(screen.getByRole('link'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('el')).toBeOnTheScreen();
});

test('render function receives props and pressed state', () => {
  const fn = jest.fn((props: PressableProps, _state: BreadcrumbLinkState) => <Pressable {...props} />);
  render(<BreadcrumbLink render={fn}>Home</BreadcrumbLink>);
  expect(fn).toHaveBeenLastCalledWith(expect.objectContaining({ accessibilityRole: 'link' }), { pressed: false });
  fireEvent(screen.getByRole('link'), 'pressIn');
  expect(fn).toHaveBeenLastCalledWith(expect.anything(), { pressed: true });
});

test('ref reaches the pressable', () => {
  const ref = createRef<View>();
  render(<BreadcrumbLink ref={ref}>Home</BreadcrumbLink>);
  expect(ref.current).not.toBeNull();
});

test('page is foreground text marked selected', () => {
  render(<BreadcrumbPage>Now</BreadcrumbPage>);
  expect(screen.getByText('Now')).toHaveStyle({ color: lightColors.foreground });
  expect(screen.getByText('Now')).toBeSelected();
});

test('separator defaults to a hidden chevron and accepts custom children', () => {
  const { rerender } = render(<BreadcrumbSeparator testID="sep" />);
  expect(screen.getByTestId('sep', hidden).props.accessibilityElementsHidden).toBe(true);
  expect(screen.UNSAFE_getByType(ChevronRight)).toBeTruthy();
  rerender(
    <BreadcrumbSeparator testID="sep">
      <RNText>/</RNText>
    </BreadcrumbSeparator>,
  );
  expect(screen.getByText('/', hidden)).toBeOnTheScreen();
});

test('default chevron flips in RTL', () => {
  jest.replaceProperty(I18nManager, 'isRTL', true);
  render(<BreadcrumbSeparator />);
  expect(screen.UNSAFE_getByType(ChevronRight).props.style).toEqual({ transform: [{ scaleX: -1 }] });
  jest.restoreAllMocks();
});

test('ellipsis is labelled More', () => {
  render(<BreadcrumbEllipsis />);
  expect(screen.getByLabelText('More')).toBeOnTheScreen();
});
