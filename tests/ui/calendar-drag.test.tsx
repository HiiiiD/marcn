import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PanResponder, View } from 'react-native';
import { Calendar } from '@/registry/marcn/ui/calendar';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const day = (name: string) => screen.getByRole('button', { name });

type Config = Record<string, (...args: any[]) => any>;
let config: Config;

beforeEach(() => {
  (View as any).prototype.measure = (cb: (...a: number[]) => void) => cb(0, 0, 700, 0, 0, 0);
  jest.spyOn(PanResponder, 'create').mockImplementation(((c: Config) => {
    config = c;
    return { panHandlers: {} };
  }) as any);
});
afterEach(() => jest.restoreAllMocks());

// Fires onLayout on the rows block (top=40) and the body (width=700); columns are 100px, rows 36px.
function layOut() {
  const layoutHosts: any[] = [];
  let node: any = day('Wednesday, May 1, 2024');
  while (node) {
    if (typeof node.type === 'string' && node.props.onLayout) layoutHosts.push(node);
    node = node.parent;
  }
  const [rows, block, body] = layoutHosts;
  const at = (y: number, width = 700) => ({ nativeEvent: { layout: { x: 0, y, width, height: 0 } } });
  fireEvent(rows, 'layout', at(40));
  fireEvent(block, 'layout', at(0));
  fireEvent(body, 'layout', at(0));
}

const grant = (x0 = 0, y0 = 0) => act(() => config.onPanResponderGrant(null, { x0, y0 }));
const move = (moveX: number, moveY: number) => act(() => config.onPanResponderMove(null, { moveX, moveY }));
// May 22 = week row 3 (19-25), column 3 (Wed)
const MAY_22 = [350, 40 + 36 * 3 + 10] as const;

test('claims the touch only while a range start is pending', () => {
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" />);
  expect(config.onStartShouldSetPanResponderCapture()).toBe(false);
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(config.onStartShouldSetPanResponderCapture()).toBe(true);
  fireEvent.press(day('Wednesday, May 22, 2024'));
  expect(config.onStartShouldSetPanResponderCapture()).toBe(false);
});

test('single mode never claims the touch', () => {
  render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" />);
  expect(config.onStartShouldSetPanResponderCapture()).toBe(false);
});

test('dragging previews the range and releasing commits it', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  layOut();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  onSelect.mockClear();

  act(() => config.onPanResponderGrant(null, { x0: 350, y0: 40 + 36 * 2 + 10 }));
  move(...MAY_22);
  expect(day('Saturday, May 18, 2024')).toBeSelected();
  expect(day('Wednesday, May 22, 2024')).toBeSelected();
  expect(onSelect).not.toHaveBeenCalled();

  act(() => config.onPanResponderRelease());
  expect(onSelect).toHaveBeenCalledWith({ from: d(2024, 5, 15), to: d(2024, 5, 22) });
  expect(day('Wednesday, May 22, 2024')).toBeSelected();
});

test('dragging before the start swaps the ends', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  layOut();
  fireEvent.press(day('Wednesday, May 22, 2024'));
  const may15 = [350, 40 + 36 * 2 + 10] as const;
  grant();
  move(...may15);
  act(() => config.onPanResponderRelease());
  expect(onSelect).toHaveBeenLastCalledWith({ from: d(2024, 5, 15), to: d(2024, 5, 22) });
});

test('terminating the gesture drops the preview without selecting', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  layOut();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  onSelect.mockClear();
  grant();
  move(...MAY_22);
  expect(day('Wednesday, May 22, 2024')).toBeSelected();
  act(() => config.onPanResponderTerminate());
  expect(day('Wednesday, May 22, 2024')).not.toBeSelected();
  expect(onSelect).not.toHaveBeenCalled();
});

test('disabled days are skipped by the drag', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" disabled={d(2024, 5, 22)} onSelect={onSelect} />);
  layOut();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  onSelect.mockClear();
  grant();
  move(...MAY_22);
  act(() => config.onPanResponderRelease());
  expect(onSelect).not.toHaveBeenCalled();
});

test('a tap while pending selects the pressed day through hit-testing', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  layOut();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  onSelect.mockClear();
  act(() => config.onPanResponderGrant(null, { x0: MAY_22[0], y0: MAY_22[1] }));
  act(() => config.onPanResponderRelease());
  expect(onSelect).toHaveBeenCalledWith({ from: d(2024, 5, 15), to: d(2024, 5, 22) });
});
