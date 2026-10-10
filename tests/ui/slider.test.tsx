import { createRef } from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import { State } from 'react-native-gesture-handler';
import { Slider } from '@/registry/marcn/ui/slider';

const layout = (width = 216) => fireEvent(screen.getByTestId('root'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 20 } } });
const action = (thumb: ReturnType<typeof screen.getAllByRole>[number], name: 'increment' | 'decrement') =>
  fireEvent(thumb, 'accessibilityAction', { nativeEvent: { actionName: name } });
const drag = (xs: number[]) =>
  fireGestureHandler(getByGestureTestId('slider'), [
    { state: State.BEGAN, x: xs[0], y: 10 },
    { state: State.ACTIVE, x: xs[0], y: 10 },
    ...xs.slice(1).map((x) => ({ x, y: 10 })),
    { state: State.END, x: xs[xs.length - 1], y: 10 },
  ]);

test('renders one adjustable thumb per value with accessibility values', () => {
  render(<Slider testID="root" defaultValue={[20, 80]} />);
  const thumbs = screen.getAllByRole('adjustable');
  expect(thumbs).toHaveLength(2);
  expect(thumbs[0]).toHaveAccessibilityValue({ min: 0, max: 100, now: 20 });
  expect(thumbs[1]).toHaveAccessibilityValue({ now: 80 });
});

test('defaults to a single thumb at min', () => {
  render(<Slider testID="root" min={10} max={50} />);
  expect(screen.getByRole('adjustable')).toHaveAccessibilityValue({ now: 10 });
});

test('increment and decrement actions move by step and commit', () => {
  const onValueChange = jest.fn();
  const onValueCommit = jest.fn();
  render(<Slider testID="root" defaultValue={[25]} step={5} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
  action(screen.getByRole('adjustable'), 'increment');
  expect(onValueChange).toHaveBeenCalledWith([30]);
  expect(onValueCommit).toHaveBeenCalledWith([30]);
  action(screen.getByRole('adjustable'), 'decrement');
  expect(onValueChange).toHaveBeenLastCalledWith([25]);
});

test('actions cannot push a thumb past its neighbour or the bounds', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[20, 21]} minStepsBetweenThumbs={1} onValueChange={onValueChange} />);
  const [first] = screen.getAllByRole('adjustable');
  action(first, 'increment');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('disabled sets accessibility state and ignores actions', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[25]} disabled onValueChange={onValueChange} />);
  const thumb = screen.getByRole('adjustable');
  expect(thumb).toBeDisabled();
  action(thumb, 'increment');
  expect(onValueChange).not.toHaveBeenCalled();
});

test('controlled: follows value, only notifies', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" value={[40]} onValueChange={onValueChange} />);
  action(screen.getByRole('adjustable'), 'increment');
  expect(onValueChange).toHaveBeenCalledWith([41]);
  expect(screen.getByRole('adjustable')).toHaveAccessibilityValue({ now: 40 });
});

test('tapping the track moves the nearest thumb there', () => {
  const onValueChange = jest.fn();
  const onValueCommit = jest.fn();
  render(<Slider testID="root" defaultValue={[0]} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
  layout(216);
  drag([108]);
  expect(onValueChange).toHaveBeenLastCalledWith([50]);
  expect(onValueCommit).toHaveBeenLastCalledWith([50]);
});

test('dragging updates continuously and stays inside the bounds', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[0]} onValueChange={onValueChange} />);
  layout(216);
  drag([8, 58, 500]);
  expect(onValueChange).toHaveBeenCalledWith([25]);
  expect(onValueChange).toHaveBeenLastCalledWith([100]);
});

test('two thumbs: the closest one moves and they cannot cross', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[20, 80]} onValueChange={onValueChange} />);
  layout(216);
  drag([208]);
  expect(onValueChange).toHaveBeenLastCalledWith([20, 100]);
  drag([8, 208]);
  expect(onValueChange).toHaveBeenLastCalledWith([100, 100]);
});

test('overlapping thumbs: dragging right moves the right thumb', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[0, 0]} onValueChange={onValueChange} />);
  layout(216);
  drag([108]);
  expect(onValueChange).toHaveBeenLastCalledWith([0, 50]);
});

test('fractional step does not leak float noise', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[0]} min={0} max={1} step={0.1} onValueChange={onValueChange} />);
  layout(216);
  drag([8 + 60]);
  const last = onValueChange.mock.calls.at(-1)?.[0] as number[];
  expect(String(last[0]).length).toBeLessThanOrEqual(4);
});

test('touching before layout never produces NaN', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[10]} onValueChange={onValueChange} />);
  drag([50]);
  for (const [values] of onValueChange.mock.calls as number[][][]) expect(values.every(Number.isFinite)).toBe(true);
});

test('min === max renders without NaN', () => {
  render(<Slider testID="root" defaultValue={[5]} min={5} max={5} />);
  layout(216);
  expect(screen.getByRole('adjustable')).toHaveAccessibilityValue({ now: 5 });
});

test('disabled ignores gestures', () => {
  const onValueChange = jest.fn();
  render(<Slider testID="root" defaultValue={[0]} disabled onValueChange={onValueChange} />);
  layout(216);
  drag([108]);
  expect(onValueChange).not.toHaveBeenCalled();
});

test('root supports ref and render element form', () => {
  const ref = createRef<View>();
  render(<Slider testID="root" ref={ref} />);
  expect(ref.current).not.toBeNull();
});
