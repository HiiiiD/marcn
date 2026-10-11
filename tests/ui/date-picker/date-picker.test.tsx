import { createRef, useState } from 'react';
import { Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { DatePicker, type DatePickerProps, type DateRange } from '@/registry/marcn/ui/date-picker';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const day = (name: string) => screen.getByRole('button', { name });
const trigger = () => screen.getByTestId('trigger');
const settle = () => act(() => jest.advanceTimersByTime(250));

function setup(props: DatePickerProps = {}) {
  return render(
    <PortalHost>
      <DatePicker locale="en-US" testID="trigger" {...props} />
    </PortalHost>,
  );
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('shows the placeholder and no calendar until pressed', () => {
  setup({ defaultMonth: d(2024, 5, 1) });
  expect(screen.getByText('Pick a date')).toBeOnTheScreen();
  expect(screen.queryByText('May 2024')).toBeNull();
  fireEvent.press(trigger());
  expect(screen.getByText('May 2024')).toBeOnTheScreen();
});

test('custom placeholder', () => {
  setup({ placeholder: 'Due date' });
  expect(screen.getByText('Due date')).toBeOnTheScreen();
});

test('single: selecting closes, shows the date and notifies', () => {
  const onSelect = jest.fn();
  setup({ defaultMonth: d(2024, 5, 1), onSelect });
  fireEvent.press(trigger());
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(onSelect).toHaveBeenCalledWith(d(2024, 5, 15));
  expect(screen.getByText('May 15, 2024')).toBeOnTheScreen();
  expect(trigger()).toBeCollapsed();
  settle();
  expect(screen.queryByText('May 2024')).toBeNull();
});

test('reopening shows the selected month again', () => {
  setup({ defaultSelected: d(2024, 5, 15) });
  fireEvent.press(trigger());
  expect(screen.getByText('May 2024')).toBeOnTheScreen();
  fireEvent.press(screen.getByLabelText('Next month'));
  expect(screen.getByText('June 2024')).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  settle();
  fireEvent.press(trigger());
  expect(screen.getByText('May 2024')).toBeOnTheScreen();
  expect(day('Wednesday, May 15, 2024')).toBeSelected();
});

test('controlled selected drives the label', () => {
  const view = setup({ selected: d(2024, 5, 15) });
  expect(screen.getByText('May 15, 2024')).toBeOnTheScreen();
  view.rerender(
    <PortalHost>
      <DatePicker locale="en-US" testID="trigger" selected={d(2024, 6, 1)} />
    </PortalHost>,
  );
  expect(screen.getByText('June 1, 2024')).toBeOnTheScreen();
});

test('controlled selected does not change until the parent updates', () => {
  const onSelect = jest.fn();
  setup({ selected: d(2024, 5, 15), onSelect });
  fireEvent.press(trigger());
  fireEvent.press(day('Monday, May 20, 2024'));
  expect(onSelect).toHaveBeenCalledWith(d(2024, 5, 20));
  expect(screen.getByText('May 15, 2024')).toBeOnTheScreen();
});

test('tapping the selected day clears it back to the placeholder', () => {
  setup({ defaultMonth: d(2024, 5, 1), closeOnSelect: false });
  fireEvent.press(trigger());
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(day('Wednesday, May 15, 2024')).toBeSelected();
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(day('Wednesday, May 15, 2024')).not.toBeSelected();
  expect(screen.getByText('Pick a date')).toBeOnTheScreen();
});

test('closeOnSelect=false keeps the popover open', () => {
  setup({ defaultMonth: d(2024, 5, 1), closeOnSelect: false });
  fireEvent.press(trigger());
  fireEvent.press(day('Wednesday, May 15, 2024'));
  settle();
  expect(screen.getByText('May 2024')).toBeOnTheScreen();
  expect(trigger()).toBeExpanded();
});

test('range: stays open after the first day, closes after the second', () => {
  const onSelect = jest.fn<void, [DateRange | undefined]>();
  setup({ mode: 'range', defaultMonth: d(2024, 5, 1), onSelect });
  fireEvent.press(trigger());
  fireEvent.press(day('Friday, May 3, 2024'));
  expect(screen.getByText('May 03, 2024')).toBeOnTheScreen();
  expect(trigger()).toBeExpanded();
  fireEvent.press(day('Monday, May 20, 2024'));
  expect(onSelect).toHaveBeenLastCalledWith({ from: d(2024, 5, 3), to: d(2024, 5, 20) });
  expect(screen.getByText('May 03, 2024 – May 20, 2024')).toBeOnTheScreen();
  expect(trigger()).toBeCollapsed();
});

test('range: placeholder when empty, both ends when set', () => {
  setup({ mode: 'range', defaultSelected: { from: d(2024, 1, 20), to: d(2024, 2, 9) } });
  expect(screen.getByText('Jan 20, 2024 – Feb 09, 2024')).toBeOnTheScreen();
});

test('formatDate overrides the label', () => {
  setup({ defaultSelected: d(2024, 5, 15), formatDate: (date) => date.toISOString().slice(0, 4) });
  expect(screen.getByText('2024')).toBeOnTheScreen();
});

test('locale formats the label', () => {
  setup({ defaultSelected: d(2024, 5, 15), locale: 'it-IT' });
  expect(screen.getByText('15 maggio 2024')).toBeOnTheScreen();
});

test('triggerDisabled does not open', () => {
  setup({ triggerDisabled: true, defaultMonth: d(2024, 5, 1) });
  expect(trigger()).toBeDisabled();
  expect(trigger()).toBeCollapsed();
  fireEvent.press(trigger());
  expect(screen.queryByText('May 2024')).toBeNull();
});

test('controlled open stays open and reports the close', () => {
  const onOpenChange = jest.fn();
  setup({ open: true, onOpenChange, defaultMonth: d(2024, 5, 1) });
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  settle();
  expect(screen.getByText('May 2024')).toBeOnTheScreen();
});

test('defaultOpen and onOpenChange on press', () => {
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, defaultMonth: d(2024, 5, 1) });
  expect(screen.getByText('May 2024')).toBeOnTheScreen();
  screen.unmount();
  setup({ onOpenChange });
  fireEvent.press(trigger());
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(trigger()).toBeExpanded();
});

test('forwards the disabled matcher to the calendar', () => {
  const onSelect = jest.fn();
  setup({ defaultMonth: d(2024, 5, 1), disabled: { dayOfWeek: [0] }, onSelect });
  fireEvent.press(trigger());
  expect(day('Sunday, May 19, 2024')).toBeDisabled();
  fireEvent.press(day('Sunday, May 19, 2024'));
  expect(onSelect).not.toHaveBeenCalled();
});

test('ref reaches the trigger host', () => {
  const ref = createRef<View>();
  setup({ ref });
  expect(ref.current).toBeTruthy();
  expect(typeof ref.current?.measureInWindow).toBe('function');
});

function Controlled({ reset }: { reset?: boolean }) {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <PortalHost>
      <DatePicker locale="en-US" testID="trigger" defaultMonth={d(2024, 5, 1)} selected={date} onSelect={setDate} />
      {reset && <Text onPress={() => setDate(undefined)}>Reset</Text>}
    </PortalHost>
  );
}

test('controlled: clearing the picked day goes back to the placeholder', () => {
  render(<Controlled />);
  fireEvent.press(trigger());
  fireEvent.press(day('Wednesday, May 15, 2024'));
  settle();
  fireEvent.press(trigger());
  fireEvent.press(day('Wednesday, May 15, 2024'));
  expect(screen.getByText('Pick a date')).toBeOnTheScreen();
});

test('controlled: an external reset goes back to the placeholder', () => {
  render(<Controlled reset />);
  fireEvent.press(trigger());
  fireEvent.press(day('Wednesday, May 15, 2024'));
  settle();
  fireEvent.press(screen.getByText('Reset'));
  expect(screen.getByText('Pick a date')).toBeOnTheScreen();
  fireEvent.press(trigger());
  expect(day('Wednesday, May 15, 2024')).not.toBeSelected();
});

test('controlled range: a rejected first day is not shown as picked', () => {
  const onSelect = jest.fn();
  setup({ mode: 'range', selected: undefined, onSelect, defaultMonth: d(2024, 5, 1) });
  fireEvent.press(trigger());
  fireEvent.press(day('Friday, May 3, 2024'));
  expect(onSelect).toHaveBeenCalledWith({ from: d(2024, 5, 3) });
  expect(day('Friday, May 3, 2024')).not.toBeSelected();
  expect(screen.getByText('Pick a date')).toBeOnTheScreen();
});
