import { useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

let latest: ReturnType<typeof useAnchoredPosition>;

function Harness({ measure, options }: { measure: Measure; options?: AnchoredOptions & { point?: { x: number; y: number } | null; fit?: boolean } }) {
  const triggerRef = useRef<View | null>(null);
  latest = useAnchoredPosition(true, triggerRef, options);
  return (
    <>
      <View
        ref={(node) => {
          triggerRef.current = node;
          if (node) node.measureInWindow = measure as never;
        }}
      />
      <Animated.View testID="surface" onLayout={latest.onLayout} style={latest.style} />
    </>
  );
}

const layout = (width: number, height: number) =>
  fireEvent(screen.getByTestId('surface'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });
const place = () => StyleSheet.flatten(screen.getByTestId('surface').props.style);

test('stays invisible until the surface has been laid out', () => {
  render(<Harness measure={(cb) => cb(100, 100, 100, 40)} />);
  expect(place().opacity).toBe(0);
});

test('places below the anchor once measured and laid out', () => {
  render(<Harness measure={(cb) => cb(100, 100, 100, 40)} />);
  layout(80, 50);
  expect(place()).toMatchObject({ left: 110, top: 144 });
  expect(latest.anchor).toEqual({ x: 100, y: 100, width: 100, height: 40 });
});

test('honors options', () => {
  render(<Harness measure={(cb) => cb(100, 100, 100, 40)} options={{ side: 'right', align: 'start', sideOffset: 10, alignOffset: 5 }} />);
  layout(80, 50);
  expect(place()).toMatchObject({ left: 210, top: 105 });
});

test('maxHeight is the free height minus the collision padding on both ends', () => {
  render(<Harness measure={(cb) => cb(0, 0, 10, 10)} options={{ collisionPadding: 10 }} />);
  expect(latest.maxHeight).toBe(Dimensions.get('window').height - 20);
});

test('zero measurements never produce NaN', () => {
  render(<Harness measure={(cb) => cb(0, 0, 0, 0)} />);
  layout(0, 0);
  const { left, top } = place();
  expect(Number.isFinite(left) && Number.isFinite(top)).toBe(true);
});

test('anchors to a point without measuring the trigger', () => {
  const measure = jest.fn();
  render(<Harness measure={measure} options={{ point: { x: 50, y: 60 }, align: 'start', sideOffset: 0 }} />);
  layout(80, 50);
  expect(measure).not.toHaveBeenCalled();
  expect(latest.anchor).toEqual({ x: 50, y: 60, width: 0, height: 0 });
  expect(place()).toMatchObject({ left: 50, top: 60 });
});

test('a point near the bottom-right edge flips above and clamps inside the window', () => {
  const { width, height } = Dimensions.get('window');
  render(<Harness measure={jest.fn()} options={{ point: { x: width - 5, y: height - 5 }, align: 'start', sideOffset: 0 }} />);
  layout(80, 50);
  const { left, top } = place();
  expect(left + 80).toBeLessThanOrEqual(width - 8);
  expect(top + 50).toBeLessThanOrEqual(height - 5);
});

describe('fit', () => {
  const H = Dimensions.get('window').height;

  test('with room below it opens downward and caps the height to that room', () => {
    render(<Harness measure={(cb) => cb(100, 100, 100, 40)} options={{ fit: true }} />);
    layout(80, 50);
    expect(place().top).toBe(144);
    expect(latest.maxHeight).toBe(H - 140 - 4 - 8);
  });

  test('without room below it opens upward and caps the height to the room above', () => {
    render(<Harness measure={(cb) => cb(100, H - 100, 100, 40)} options={{ fit: true }} />);
    layout(80, 120);
    expect(place().top).toBe(H - 100 - 4 - 120);
    expect(latest.maxHeight).toBe(H - 100 - 4 - 8);
  });
});
