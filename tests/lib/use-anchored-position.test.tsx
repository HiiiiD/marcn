import { useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';

type Measure = (cb: (x: number, y: number, w: number, h: number) => void) => void;

let latest: ReturnType<typeof useAnchoredPosition>;

function Harness({ measure, options }: { measure: Measure; options?: AnchoredOptions }) {
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
