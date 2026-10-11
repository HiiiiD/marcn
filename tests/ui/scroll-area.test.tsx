import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { ScrollView, Text as RNText, View } from 'react-native';
import { ScrollArea, ScrollBar } from '@/registry/marcn/ui/scroll-area';
import { lightColors } from '@/registry/marcn/lib/theme';

const hidden = { includeHiddenElements: true };
const layout = (el: ReturnType<typeof screen.getByTestId>, width: number, height: number) =>
  fireEvent(el, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });

function area(props: Record<string, unknown> = {}) {
  render(
    <ScrollArea testID="sv" {...props}>
      <RNText>row</RNText>
    </ScrollArea>,
  );
  return screen.getByTestId('sv');
}

test('hides native indicators and renders the children', () => {
  const sv = area();
  expect(sv.props.showsVerticalScrollIndicator).toBe(false);
  expect(sv.props.showsHorizontalScrollIndicator).toBe(false);
  expect(screen.getByText('row')).toBeOnTheScreen();
});

test('no thumb until content overflows the viewport', () => {
  const sv = area({ scrollBar: <ScrollBar testID="bar" /> });
  layout(sv, 100, 200);
  fireEvent(sv, 'contentSizeChange', 100, 200);
  expect(screen.queryByTestId('bar-thumb', hidden)).toBeNull();
  fireEvent(sv, 'contentSizeChange', 100, 400);
  expect(screen.getByTestId('bar-thumb', hidden)).toHaveStyle({ height: 99, backgroundColor: lightColors.border });
});

test('thumb follows the scroll offset', () => {
  const sv = area({ scrollBar: <ScrollBar testID="bar" /> });
  layout(sv, 100, 200);
  fireEvent(sv, 'contentSizeChange', 100, 400);
  fireEvent.scroll(sv, { nativeEvent: { contentOffset: { x: 0, y: 200 } } });
  expect(screen.getByTestId('bar-thumb', hidden)).toHaveStyle({ transform: [{ translateY: 99 }] });
});

test('horizontal area gets a horizontal thumb', () => {
  const sv = area({ horizontal: true, scrollBar: <ScrollBar testID="bar" /> });
  layout(sv, 200, 100);
  fireEvent(sv, 'contentSizeChange', 400, 100);
  fireEvent.scroll(sv, { nativeEvent: { contentOffset: { x: 100, y: 0 } } });
  expect(screen.getByTestId('bar-thumb', hidden)).toHaveStyle({ width: 99, transform: [{ translateX: 49.5 }] });
});

test('default bar renders without a prop and scrollBar={null} removes it', () => {
  const { unmount } = render(
    <ScrollArea testID="sv">
      <RNText>x</RNText>
    </ScrollArea>,
  );
  const sv = screen.getByTestId('sv');
  layout(sv, 100, 200);
  fireEvent(sv, 'contentSizeChange', 100, 400);
  expect(screen.UNSAFE_queryAllByType(View).length).toBeGreaterThan(0);
  unmount();
  render(
    <ScrollArea testID="sv" scrollBar={null}>
      <RNText>x</RNText>
    </ScrollArea>,
  );
  layout(screen.getByTestId('sv'), 100, 200);
  fireEvent(screen.getByTestId('sv'), 'contentSizeChange', 100, 400);
  expect(screen.queryByTestId('sv-thumb', hidden)).toBeNull();
});

test('caller handlers still run and the ref reaches the ScrollView', () => {
  const onScroll = jest.fn();
  const onLayout = jest.fn();
  const onContentSizeChange = jest.fn();
  const ref = createRef<ScrollView>();
  render(
    <ScrollArea testID="sv" ref={ref} onScroll={onScroll} onLayout={onLayout} onContentSizeChange={onContentSizeChange}>
      <RNText>x</RNText>
    </ScrollArea>,
  );
  const sv = screen.getByTestId('sv');
  layout(sv, 100, 200);
  fireEvent(sv, 'contentSizeChange', 100, 400);
  fireEvent.scroll(sv, { nativeEvent: { contentOffset: { x: 0, y: 10 } } });
  expect(onLayout).toHaveBeenCalledTimes(1);
  expect(onContentSizeChange).toHaveBeenCalledWith(100, 400);
  expect(onScroll).toHaveBeenCalledTimes(1);
  expect(ref.current).not.toBeNull();
});

test('a bar of the other axis renders nothing', () => {
  const sv = area({ scrollBar: <ScrollBar testID="bar" orientation="horizontal" /> });
  layout(sv, 100, 200);
  fireEvent(sv, 'contentSizeChange', 100, 400);
  expect(screen.queryByTestId('bar-thumb', hidden)).toBeNull();
});

test('ScrollBar outside a ScrollArea throws a clear error', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<ScrollBar />)).toThrow('ScrollBar must be used within <ScrollArea>');
  jest.restoreAllMocks();
});
