import { fireEvent, render, screen } from '@testing-library/react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { I18nManager } from 'react-native';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/registry/marcn/ui/pagination';
import { lightColors } from '@/registry/marcn/lib/theme';

test('Pagination is a labelled navigation landmark with a centered row', () => {
  render(
    <Pagination>
      <PaginationContent testID="content">
        <PaginationItem />
      </PaginationContent>
    </Pagination>,
  );
  expect(screen.getByLabelText('pagination')).toBeOnTheScreen();
  expect(screen.getByTestId('content')).toHaveStyle({ flexDirection: 'row' });
});

test('inactive link is ghost, active is outline and selected', () => {
  render(
    <>
      <PaginationLink testID="a">1</PaginationLink>
      <PaginationLink testID="b" isActive>2</PaginationLink>
    </>,
  );
  expect(screen.getByTestId('a')).toHaveStyle({ width: 36, height: 36 });
  expect(screen.getByTestId('a')).not.toBeSelected();
  expect(screen.getByTestId('b')).toHaveStyle({ backgroundColor: lightColors.background, borderWidth: 1 });
  expect(screen.getByTestId('b')).toBeSelected();
});

test('link fires onPress and disabled blocks it', () => {
  const onPress = jest.fn();
  const { rerender } = render(<PaginationLink onPress={onPress}>1</PaginationLink>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
  rerender(<PaginationLink onPress={onPress} disabled>1</PaginationLink>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button')).toBeDisabled();
});

test('previous and next show default text, labels and chevrons', () => {
  render(
    <>
      <PaginationPrevious />
      <PaginationNext />
    </>,
  );
  expect(screen.getByText('Previous')).toBeOnTheScreen();
  expect(screen.getByText('Next')).toBeOnTheScreen();
  expect(screen.getByLabelText('Go to previous page')).toBeOnTheScreen();
  expect(screen.getByLabelText('Go to next page')).toBeOnTheScreen();
  expect(screen.UNSAFE_getByType(ChevronLeft)).toBeTruthy();
  expect(screen.UNSAFE_getByType(ChevronRight)).toBeTruthy();
});

test('text prop customizes and text={null} renders an icon-only square button', () => {
  const { rerender } = render(<PaginationNext text="Older" />);
  expect(screen.getByText('Older')).toBeOnTheScreen();
  rerender(<PaginationNext text={null} />);
  expect(screen.queryByText('Next')).toBeNull();
  expect(screen.getByLabelText('Go to next page')).toHaveStyle({ width: 36, height: 36 });
});

test('chevrons flip in RTL', () => {
  jest.replaceProperty(I18nManager, 'isRTL', true);
  render(<PaginationPrevious />);
  expect(screen.UNSAFE_getByType(ChevronLeft).props.style).toEqual({ transform: [{ scaleX: -1 }] });
  jest.restoreAllMocks();
});

test('ellipsis is labelled More pages', () => {
  render(<PaginationEllipsis />);
  expect(screen.getByLabelText('More pages')).toBeOnTheScreen();
});
