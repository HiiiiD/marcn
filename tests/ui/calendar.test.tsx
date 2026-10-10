import { createRef } from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Calendar } from '@/registry/marcn/ui/calendar';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const day = (name: string) => screen.getByRole('button', { name });

test('renders caption, weekdays and days for the month', () => {
  render(<Calendar defaultMonth={d(2024, 2, 1)} locale="en-US" />);
  expect(screen.getByText('February 2024')).toBeTruthy();
  expect(screen.getByText('Sun')).toBeTruthy();
  expect(day('Thursday, February 29, 2024')).toBeTruthy();
});

test('weekStartsOn reorders weekday headers', () => {
  render(<Calendar defaultMonth={d(2024, 2, 1)} locale="en-US" weekStartsOn={1} />);
  const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shown = screen.getAllByText(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/).map((n) => n.props.children);
  expect(shown).toEqual(order);
});

test('navigates months and notifies', () => {
  const onMonthChange = jest.fn();
  render(<Calendar defaultMonth={d(2024, 1, 1)} locale="en-US" onMonthChange={onMonthChange} />);
  fireEvent.press(screen.getByLabelText('Next month'));
  expect(screen.getByText('February 2024')).toBeTruthy();
  expect(onMonthChange).toHaveBeenCalledWith(d(2024, 2, 1));
  fireEvent.press(screen.getByLabelText('Previous month'));
  fireEvent.press(screen.getByLabelText('Previous month'));
  expect(screen.getByText('December 2023')).toBeTruthy();
});

test('controlled month does not move until the parent updates', () => {
  render(<Calendar month={d(2024, 1, 1)} locale="en-US" />);
  fireEvent.press(screen.getByLabelText('Next month'));
  expect(screen.getByText('January 2024')).toBeTruthy();
});

test('single: selects, deselects, required keeps', () => {
  const onSelect = jest.fn();
  const { unmount } = render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith(d(2024, 5, 15));
  expect(day('Wednesday, May 15, 2024')).toBeSelected();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith(undefined);
  expect(day('Wednesday, May 15, 2024')).not.toBeSelected();

  unmount();
  render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" required defaultSelected={d(2024, 5, 15)} onSelect={onSelect} />);
  onSelect.mockClear();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(onSelect).not.toHaveBeenCalled();
});

test('controlled selected follows prop', () => {
  const { rerender } = render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" selected={d(2024, 5, 3)} />);
  expect(day('Friday, May 3, 2024')).toBeSelected();
  fireEvent.press(day('Saturday, May 4, 2024'));
  expect(day('Saturday, May 4, 2024')).not.toBeSelected();
  rerender(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" selected={d(2024, 5, 4)} />);
  expect(day('Saturday, May 4, 2024')).toBeSelected();
});

test('multiple: toggles several, respects max', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="multiple" max={2} defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  fireEvent.press(day('Wednesday, May 1, 2024'));
  fireEvent.press(day('Thursday, May 2, 2024'));
  fireEvent.press(day('Friday, May 3, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith([d(2024, 5, 1), d(2024, 5, 2)]);
  fireEvent.press(day('Wednesday, May 1, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith([d(2024, 5, 2)]);
});

test('range: picks from/to and marks days between', () => {
  const onSelect = jest.fn();
  render(<Calendar mode="range" defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
  fireEvent.press(day('Wednesday, May 1, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith({ from: d(2024, 5, 1) });
  fireEvent.press(day('Friday, May 3, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith({ from: d(2024, 5, 1), to: d(2024, 5, 3) });
  expect(day('Thursday, May 2, 2024')).toBeSelected();
  expect(day('Saturday, May 4, 2024')).not.toBeSelected();
});

test('disabled matcher blocks press and sets state', () => {
  const onSelect = jest.fn();
  render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" disabled={{ before: d(2024, 5, 10) }} onSelect={onSelect} />);
  expect(day('Wednesday, May 1, 2024')).toBeDisabled();
  fireEvent.press(day('Wednesday, May 1, 2024'));
  expect(onSelect).not.toHaveBeenCalled();
  expect(day('Friday, May 10, 2024')).toBeEnabled();
});

test('outside days render by default, hidden with showOutsideDays=false', () => {
  const { rerender } = render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" />);
  expect(day('Monday, April 29, 2024')).toBeTruthy();
  rerender(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" showOutsideDays={false} />);
  expect(screen.queryByRole('button', { name: 'Monday, April 29, 2024' })).toBeNull();
});

test('forwards ref', () => {
  const ref = createRef<View>();
  render(<Calendar ref={ref} />);
  expect(ref.current).toBeTruthy();
});
