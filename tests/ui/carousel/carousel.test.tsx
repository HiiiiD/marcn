import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { I18nManager, ScrollView, Text as RNText } from 'react-native';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/registry/marcn/ui/carousel';
import { useCarousel } from '@/registry/marcn/ui/carousel/context';

beforeEach(() => {
  jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(0);
    return 0;
  });
});

const item = (x: number, y: number, width: number, height: number) => ({ nativeEvent: { layout: { x, y, width, height } } });

function setup({
  count = 4,
  viewport = 100,
  size = 100,
  gap = 16,
  props = {},
  contentProps = {},
}: { count?: number; viewport?: number; size?: number; gap?: number; props?: Record<string, unknown>; contentProps?: Record<string, unknown> } = {}) {
  const scrollRef = createRef<ScrollView>();
  render(
    <Carousel gap={gap} {...props}>
      <CarouselContent testID="content" ref={scrollRef} {...contentProps}>
        {Array.from({ length: count }, (_, i) => (
          <CarouselItem key={i} testID={`item-${i}`} basis={size > 1 ? size : undefined}>
            <RNText>{`slide ${i}`}</RNText>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>,
  );
  const content = screen.getByTestId('content');
  fireEvent(content, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: viewport, height: viewport } } });
  for (let i = 0; i < count; i++) {
    fireEvent(screen.getByTestId(`item-${i}`), 'layout', item(i * (size + gap), 0, size, size));
  }
  fireEvent(content, 'contentSizeChange', count * size + (count - 1) * gap, viewport);
  const scrollTo = scrollRef.current ? jest.spyOn(scrollRef.current, 'scrollTo') : undefined;
  return { content, scrollTo };
}

const scrollEnd = (content: ReturnType<typeof screen.getByTestId>, x: number) => {
  fireEvent.scroll(content, { nativeEvent: { contentOffset: { x, y: 0 } } });
  fireEvent(content, 'momentumScrollEnd', { nativeEvent: { contentOffset: { x, y: 0 } } });
};

test('renders slides before any layout (viewport 0) without crashing', () => {
  render(
    <Carousel>
      <CarouselContent>
        <CarouselItem>
          <RNText>a</RNText>
        </CarouselItem>
      </CarouselContent>
    </Carousel>,
  );
  expect(screen.getByText('a')).toBeOnTheScreen();
});

test('renders with zero items', () => {
  render(
    <Carousel>
      <CarouselContent testID="c" />
    </Carousel>,
  );
  expect(screen.getByTestId('c')).toBeOnTheScreen();
});

test('snap mode sets one-slide-per-flick snapping at the item offsets', () => {
  const { content } = setup();
  expect(content.props.snapToOffsets).toEqual([0, 116, 232, 348]);
  expect(content.props.decelerationRate).toBe('fast');
  expect(content.props.disableIntervalMomentum).toBe(true);
  expect(content.props.horizontal).toBe(true);
  expect(content.props.showsHorizontalScrollIndicator).toBe(false);
});

test('snap offsets clamp so the last slide stays reachable and dedupe', () => {
  const { content } = setup({ viewport: 300 });
  expect(content.props.snapToOffsets).toEqual([0, 116, 148]);
});

test('center align shifts the snap offsets', () => {
  const { content } = setup({ viewport: 200, props: { align: 'center' } });
  expect(content.props.snapToOffsets).toEqual([0, 66, 182, 248]);
});

test('snap={false} has no snap props', () => {
  const { content } = setup({ props: { snap: false } });
  expect(content.props.snapToOffsets).toBeUndefined();
  expect(content.props.disableIntervalMomentum).toBeFalsy();
});

test('vertical orientation scrolls vertically', () => {
  const { content } = setup({ props: { orientation: 'vertical' } });
  expect(content.props.horizontal).toBe(false);
});

test('item basis sizes the slide: fraction of viewport or pixels', () => {
  render(
    <Carousel>
      <CarouselContent testID="c">
        <CarouselItem testID="half" basis={0.5}>x</CarouselItem>
        <CarouselItem testID="px" basis={120}>y</CarouselItem>
        <CarouselItem testID="full">z</CarouselItem>
      </CarouselContent>
    </Carousel>,
  );
  fireEvent(screen.getByTestId('c'), 'layout', item(0, 0, 300, 300));
  expect(screen.getByTestId('half')).toHaveStyle({ width: 150 });
  expect(screen.getByTestId('px')).toHaveStyle({ width: 120 });
  expect(screen.getByTestId('full')).toHaveStyle({ width: 300 });
});

test('items are labelled "i of n"', () => {
  setup({ count: 3 });
  expect(screen.getByLabelText('2 of 3')).toBeOnTheScreen();
});

test('momentum end reports the nearest slide', () => {
  const onIndexChange = jest.fn();
  const { content } = setup({ props: { onIndexChange } });
  scrollEnd(content, 120);
  expect(onIndexChange).toHaveBeenLastCalledWith(1);
  scrollEnd(content, 350);
  expect(onIndexChange).toHaveBeenLastCalledWith(3);
});

test('free mode reports the leading item', () => {
  const onIndexChange = jest.fn();
  const { content } = setup({ props: { snap: false, onIndexChange } });
  scrollEnd(content, 217);
  expect(onIndexChange).toHaveBeenLastCalledWith(2);
});

test('useCarousel exposes scrollTo that moves to the slide offset', () => {
  let api!: ReturnType<typeof useCarousel>;
  function Probe() {
    api = useCarousel();
    return null;
  }
  const scrollRef = createRef<ScrollView>();
  render(
    <Carousel gap={16}>
      <Probe />
      <CarouselContent testID="c" ref={scrollRef}>
        {[0, 1, 2].map((i) => (
          <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>,
  );
  const content = screen.getByTestId('c');
  fireEvent(content, 'layout', item(0, 0, 100, 100));
  [0, 1, 2].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
  fireEvent(content, 'contentSizeChange', 332, 100);
  const spy = jest.spyOn(scrollRef.current!, 'scrollTo');
  act(() => api.scrollTo(2));
  expect(spy).toHaveBeenLastCalledWith({ x: 232, animated: true });
  expect(api.index).toBe(2);
});

test('controlled index scrolls to that slide and does not bounce a clamped tail', () => {
  const onIndexChange = jest.fn();
  const scrollRef = createRef<ScrollView>();
  const tree = (index: number) => (
    <Carousel gap={16} index={index} onIndexChange={onIndexChange}>
      <CarouselContent testID="c" ref={scrollRef}>
        {[0, 1, 2, 3].map((i) => (
          <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
  const { rerender } = render(tree(0));
  const content = screen.getByTestId('c');
  fireEvent(content, 'layout', item(0, 0, 200, 100));
  [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
  fireEvent(content, 'contentSizeChange', 448, 100);
  const spy = jest.spyOn(scrollRef.current!, 'scrollTo');
  rerender(tree(3));
  expect(spy).toHaveBeenLastCalledWith({ x: 248, animated: true });
  scrollEnd(content, 248);
  expect(onIndexChange).not.toHaveBeenCalled();
});

test('useCarousel outside a Carousel throws', () => {
  function Probe() {
    useCarousel();
    return null;
  }
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<Probe />)).toThrow('useCarousel must be used within <Carousel>');
  jest.restoreAllMocks();
});

function withButtons(props: Record<string, unknown> = {}) {
  const scrollRef = createRef<ScrollView>();
  render(
    <Carousel gap={16} {...props}>
      <CarouselContent testID="c" ref={scrollRef}>
        {[0, 1, 2, 3].map((i) => (
          <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>,
  );
  const content = screen.getByTestId('c');
  const vertical = props.orientation === 'vertical';
  fireEvent(content, 'layout', item(0, 0, 100, 100));
  [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', vertical ? item(0, i * 116, 100, 100) : item(i * 116, 0, 100, 100)));
  fireEvent(content, 'contentSizeChange', vertical ? 100 : 448, vertical ? 448 : 100);
  return { content, spy: jest.spyOn(scrollRef.current!, 'scrollTo') };
}

test('previous is disabled at the start, next at the end; labels are set', () => {
  const { content } = withButtons();
  expect(screen.getByLabelText('Previous slide')).toBeDisabled();
  expect(screen.getByLabelText('Next slide')).not.toBeDisabled();
  scrollEnd(content, 348);
  expect(screen.getByLabelText('Next slide')).toBeDisabled();
  expect(screen.getByLabelText('Previous slide')).not.toBeDisabled();
});

test('next and previous scroll to the neighbouring slide and move the index', () => {
  const onIndexChange = jest.fn();
  const { spy } = withButtons({ onIndexChange });
  fireEvent.press(screen.getByLabelText('Next slide'));
  expect(spy).toHaveBeenLastCalledWith({ x: 116, animated: true });
  expect(onIndexChange).toHaveBeenLastCalledWith(1);
});

test('next/previous work in free mode by item start', () => {
  const { content, spy } = withButtons({ snap: false });
  fireEvent.scroll(content, { nativeEvent: { contentOffset: { x: 130, y: 0 } } });
  fireEvent.press(screen.getByLabelText('Next slide'));
  expect(spy).toHaveBeenLastCalledWith({ x: 232, animated: true });
  fireEvent.press(screen.getByLabelText('Previous slide'));
  expect(spy).toHaveBeenLastCalledWith({ x: 116, animated: true });
});

test('caller onPress still runs', () => {
  const onPress = jest.fn();
  render(
    <Carousel gap={16}>
      <CarouselContent testID="c">
        {[0, 1].map((i) => (
          <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext onPress={onPress} />
    </Carousel>,
  );
  fireEvent(screen.getByTestId('c'), 'layout', item(0, 0, 100, 100));
  [0, 1].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
  fireEvent(screen.getByTestId('c'), 'contentSizeChange', 216, 100);
  fireEvent.press(screen.getByLabelText('Next slide'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('vertical carousels use up/down chevrons and the y axis', () => {
  const { spy } = withButtons({ orientation: 'vertical' });
  expect(screen.UNSAFE_getByType(ChevronUp)).toBeTruthy();
  expect(screen.UNSAFE_getByType(ChevronDown)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Next slide'));
  expect(spy).toHaveBeenLastCalledWith({ y: 116, animated: true });
});

test('horizontal chevrons flip in RTL', () => {
  jest.replaceProperty(I18nManager, 'isRTL', true);
  withButtons();
  expect(screen.UNSAFE_getByType(ChevronLeft).props.style).toEqual({ transform: [{ scaleX: -1 }] });
  expect(screen.UNSAFE_getByType(ChevronRight).props.style).toEqual({ transform: [{ scaleX: -1 }] });
  jest.restoreAllMocks();
});

test('buttons overlay the edges inside the carousel', () => {
  withButtons();
  expect(screen.getByLabelText('Previous slide')).toHaveStyle({ position: 'absolute', start: 8 });
  expect(screen.getByLabelText('Next slide')).toHaveStyle({ position: 'absolute', end: 8 });
});

test('nested scrolling is enabled so vertical carousels scroll inside a vertical page on Android', () => {
  const { content } = setup({ props: { orientation: 'vertical' } });
  expect(content.props.nestedScrollEnabled).toBe(true);
});

function mount(props: Record<string, unknown>, count = 4) {
  const scrollRef = createRef<ScrollView>();
  const tree = (n: number) => (
    <Carousel gap={16} {...props}>
      <CarouselContent testID="c" ref={scrollRef}>
        {Array.from({ length: n }, (_, i) => (
          <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
  const utils = render(tree(count));
  return { ...utils, tree, scrollRef, content: screen.getByTestId('c') };
}

test('defaultIndex is applied once real layouts arrive after a natural-size first pass', () => {
  const { content, scrollRef } = mount({ defaultIndex: 3 });
  const spy = jest.spyOn(scrollRef.current!, 'scrollTo');
  spy.mockClear();
  fireEvent(content, 'layout', item(0, 0, 100, 100));
  [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 10, 0, 10, 10)));
  fireEvent(content, 'contentSizeChange', 40, 100);
  expect(spy).not.toHaveBeenCalled();
  [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
  fireEvent(content, 'contentSizeChange', 448, 100);
  expect(spy).toHaveBeenLastCalledWith({ x: 348, animated: false });
});

test('a viewport resize re-syncs the scroll position to the current slide', () => {
  const { content, scrollRef } = mount({ defaultIndex: 3 });
  fireEvent(content, 'layout', item(0, 0, 100, 100));
  [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
  fireEvent(content, 'contentSizeChange', 448, 100);
  const spy = jest.spyOn(scrollRef.current!, 'scrollTo');
  fireEvent(content, 'layout', item(0, 0, 150, 100));
  expect(spy).toHaveBeenLastCalledWith({ x: 298, animated: false });
});

test('count follows the children, so removed slides are forgotten', () => {
  let api!: ReturnType<typeof useCarousel>;
  function Probe() {
    api = useCarousel();
    return null;
  }
  const tree = (n: number) => (
    <Carousel gap={16}>
      <Probe />
      <CarouselContent testID="c">
        {Array.from({ length: n }, (_, i) => (
          <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
  const { rerender } = render(tree(4));
  [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
  expect(api.count).toBe(4);
  rerender(tree(2));
  expect(api.count).toBe(2);
});

test('free mode updates the index when a drag ends with no velocity (iOS slow release)', () => {
  const onIndexChange = jest.fn();
  const { content } = setup({ props: { snap: false, onIndexChange } });
  const drag = (x: number, velocity?: { x: number; y: number }) =>
    fireEvent(content, 'scrollEndDrag', { nativeEvent: { contentOffset: { x, y: 0 }, velocity } });
  drag(217, { x: 2, y: 0 });
  expect(onIndexChange).not.toHaveBeenCalled();
  drag(217, { x: 0, y: 0 });
  expect(onIndexChange).toHaveBeenLastCalledWith(2);
});

test('string and number children are wrapped in Text', () => {
  render(
    <Carousel>
      <CarouselContent>
        {'plain'}
        {0}
      </CarouselContent>
    </Carousel>,
  );
  expect(screen.getByText('plain')).toBeOnTheScreen();
  expect(screen.getByText('0')).toBeOnTheScreen();
});

test('scrolling in the middle does not re-render the carousel on every event', () => {
  let renders = 0;
  function Probe() {
    useCarousel();
    renders++;
    return null;
  }
  const { content } = (() => {
    render(
      <Carousel gap={16}>
        <Probe />
        <CarouselContent testID="c">
          {[0, 1, 2, 3].map((i) => (
            <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>,
    );
    const c = screen.getByTestId('c');
    fireEvent(c, 'layout', item(0, 0, 100, 100));
    [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(i * 116, 0, 100, 100)));
    fireEvent(c, 'contentSizeChange', 448, 100);
    return { content: c };
  })();
  fireEvent.scroll(content, { nativeEvent: { contentOffset: { x: 20, y: 0 } } });
  const afterEdge = renders;
  for (let x = 21; x <= 60; x += 4) fireEvent.scroll(content, { nativeEvent: { contentOffset: { x, y: 0 } } });
  expect(renders).toBe(afterEdge);
});

describe('RTL (Android mirrors item x and reports physical scrollX)', () => {
  const mirrored = (i: number) => 448 - i * 116 - 100;

  function rtlSetup(props: Record<string, unknown> = {}) {
    const scrollRef = createRef<ScrollView>();
    render(
      <Carousel gap={16} {...props}>
        <CarouselContent testID="c" ref={scrollRef}>
          {[0, 1, 2, 3].map((i) => (
            <CarouselItem key={i} testID={`i${i}`} basis={100}>x</CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    const content = screen.getByTestId('c');
    fireEvent(content, 'layout', item(0, 0, 200, 100));
    [0, 1, 2, 3].forEach((i) => fireEvent(screen.getByTestId(`i${i}`), 'layout', item(mirrored(i), 0, 100, 100)));
    fireEvent(content, 'contentSizeChange', 448, 100);
    return { content, spy: jest.spyOn(scrollRef.current!, 'scrollTo') };
  }

  test('snap offsets are the physical positions of the mirrored slides', () => {
    const { content } = rtlSetup();
    expect(content.props.snapToOffsets).toEqual([0, 16, 132, 248]);
  });

  test('item 0 sits at the largest physical offset: previous disabled, next moves toward smaller x', () => {
    const onIndexChange = jest.fn();
    const { content, spy } = rtlSetup({ onIndexChange });
    fireEvent.scroll(content, { nativeEvent: { contentOffset: { x: 248, y: 0 } } });
    expect(screen.getByLabelText('Previous slide')).toBeDisabled();
    expect(screen.getByLabelText('Next slide')).not.toBeDisabled();
    fireEvent.press(screen.getByLabelText('Next slide'));
    expect(spy).toHaveBeenLastCalledWith({ x: 132, animated: true });
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  test('the last slide is at physical 0: next disabled, index reports the last slide', () => {
    const onIndexChange = jest.fn();
    const { content } = rtlSetup({ onIndexChange });
    scrollEnd(content, 0);
    expect(screen.getByLabelText('Next slide')).toBeDisabled();
    expect(screen.getByLabelText('Previous slide')).not.toBeDisabled();
    expect(onIndexChange).toHaveBeenLastCalledWith(3);
  });

  test('defaultIndex scrolls to the mirrored position', () => {
    const { spy } = rtlSetup({ defaultIndex: 2 });
    expect(spy).toHaveBeenLastCalledWith({ x: 16, animated: false });
  });
});
