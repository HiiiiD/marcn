import { fireEvent, render, screen } from '@testing-library/react-native';
import { Calendar } from '@/registry/marcn/ui/calendar';

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);
const day = (name: string) => screen.getByRole('button', { name });
const btn = (name: string) => screen.getByRole('button', { name });

describe('bounds', () => {
  test('arrows disable at startMonth and endMonth', () => {
    render(<Calendar defaultMonth={d(2024, 5, 1)} startMonth={d(2024, 5, 1)} endMonth={d(2024, 6, 1)} locale="en-US" />);
    expect(screen.getByLabelText('Previous month')).toBeDisabled();
    fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByText('June 2024')).toBeTruthy();
    expect(screen.getByLabelText('Next month')).toBeDisabled();
  });

  test('defaultMonth is clamped into bounds', () => {
    render(<Calendar defaultMonth={d(2020, 1, 1)} startMonth={d(2024, 3, 1)} locale="en-US" />);
    expect(screen.getByText('March 2024')).toBeTruthy();
  });

  test('days of out-of-bounds months are disabled', () => {
    render(<Calendar defaultMonth={d(2024, 5, 1)} startMonth={d(2024, 5, 1)} locale="en-US" />);
    expect(day('Monday, April 29, 2024')).toBeDisabled();
    expect(day('Wednesday, May 1, 2024')).toBeEnabled();
  });
});

describe('captionLayout="dropdown"', () => {
  test('label layout has no picker button', () => {
    render(<Calendar defaultMonth={d(2024, 5, 1)} locale="en-US" />);
    expect(screen.queryByLabelText('Choose month and year')).toBeNull();
  });

  test('caption -> months -> year -> month returns to days', () => {
    const onMonthChange = jest.fn();
    render(<Calendar captionLayout="dropdown" defaultMonth={d(2024, 5, 1)} locale="en-US" onMonthChange={onMonthChange} />);
    fireEvent.press(screen.getByLabelText('Choose month and year'));
    expect(screen.getByText('2024')).toBeTruthy();
    expect(btn('May')).toBeSelected();
    fireEvent.press(screen.getByLabelText('Choose year'));
    expect(screen.getByText('2016 – 2027')).toBeTruthy();
    fireEvent.press(btn('2019'));
    fireEvent.press(btn('Sep'));
    expect(screen.getByText('September 2019')).toBeTruthy();
    expect(onMonthChange).toHaveBeenCalledWith(d(2019, 9, 1));
  });

  test('year arrows and year-page arrows move', () => {
    render(<Calendar captionLayout="dropdown" defaultMonth={d(2024, 5, 1)} locale="en-US" />);
    fireEvent.press(screen.getByLabelText('Choose month and year'));
    fireEvent.press(screen.getByLabelText('Next year'));
    expect(screen.getByText('2025')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Choose year'));
    fireEvent.press(screen.getByLabelText('Previous years'));
    expect(screen.getByText('2004 – 2015')).toBeTruthy();
  });

  test('months and years outside bounds are disabled', () => {
    render(<Calendar captionLayout="dropdown" defaultMonth={d(2024, 5, 1)} startMonth={d(2024, 3, 1)} endMonth={d(2025, 2, 1)} locale="en-US" />);
    fireEvent.press(screen.getByLabelText('Choose month and year'));
    expect(btn('Feb')).toBeDisabled();
    expect(btn('Mar')).toBeEnabled();
    expect(screen.getByLabelText('Previous year')).toBeDisabled();
    fireEvent.press(screen.getByLabelText('Choose year'));
    expect(btn('2023')).toBeDisabled();
    expect(btn('2025')).toBeEnabled();
    expect(btn('2026')).toBeDisabled();
  });
});

describe('numberOfMonths', () => {
  test('renders consecutive months, hides outside days, steps one month', () => {
    render(<Calendar numberOfMonths={2} defaultMonth={d(2024, 5, 1)} locale="en-US" />);
    expect(screen.getByText('May 2024')).toBeTruthy();
    expect(screen.getByText('June 2024')).toBeTruthy();
    expect(day('Wednesday, May 1, 2024')).toBeTruthy();
    expect(day('Saturday, June 1, 2024')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Monday, April 29, 2024' })).toBeNull();
    fireEvent.press(screen.getByLabelText('Next month'));
    expect(screen.getByText('July 2024')).toBeTruthy();
  });

  test('range spans two visible months without navigating', () => {
    const onSelect = jest.fn();
    render(<Calendar mode="range" numberOfMonths={2} defaultMonth={d(2024, 5, 1)} locale="en-US" onSelect={onSelect} />);
    fireEvent.press(day('Friday, May 31, 2024'));
    fireEvent.press(day('Monday, June 3, 2024'));
    expect(onSelect).toHaveBeenLastCalledWith({ from: d(2024, 5, 31), to: d(2024, 6, 3) });
    expect(day('Saturday, June 1, 2024')).toBeSelected();
  });

  test('endMonth blocks navigation past the last visible month', () => {
    render(<Calendar numberOfMonths={2} defaultMonth={d(2024, 5, 1)} endMonth={d(2024, 6, 1)} locale="en-US" />);
    expect(screen.getByLabelText('Next month')).toBeDisabled();
  });
});
