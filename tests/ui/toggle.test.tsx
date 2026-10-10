import { createRef } from 'react';
import { Pressable, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { lightColors } from '@/registry/marcn/lib/theme';
import { Toggle } from '@/registry/marcn/ui/toggle';

test('has button role, off by default, toggles on press', () => {
  const onPressedChange = jest.fn();
  render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);
  const toggle = screen.getByRole('button');
  expect(toggle).not.toBeSelected();
  fireEvent.press(toggle);
  expect(toggle).toBeSelected();
  expect(onPressedChange).toHaveBeenCalledWith(true);
  fireEvent.press(toggle);
  expect(toggle).not.toBeSelected();
  expect(onPressedChange).toHaveBeenLastCalledWith(false);
});

test('defaultPressed starts on', () => {
  render(<Toggle defaultPressed>Bold</Toggle>);
  expect(screen.getByRole('button')).toBeSelected();
});

test('controlled: follows pressed, only notifies on press', () => {
  const onPressedChange = jest.fn();
  render(
    <Toggle pressed={false} onPressedChange={onPressedChange}>
      Bold
    </Toggle>,
  );
  fireEvent.press(screen.getByRole('button'));
  expect(onPressedChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole('button')).not.toBeSelected();
});

test('disabled blocks press', () => {
  const onPressedChange = jest.fn();
  render(
    <Toggle disabled onPressedChange={onPressedChange}>
      Bold
    </Toggle>,
  );
  fireEvent.press(screen.getByRole('button'));
  expect(onPressedChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toBeDisabled();
});

test('string children inherit the toggle text style, which changes when on', () => {
  render(<Toggle defaultPressed>Bold</Toggle>);
  expect(screen.getByText('Bold')).toHaveStyle({ color: lightColors.accentForeground });
  fireEvent.press(screen.getByRole('button'));
  expect(screen.getByText('Bold')).toHaveStyle({ color: lightColors.foreground });
});

test('outline variant has a border', () => {
  render(<Toggle variant="outline">Bold</Toggle>);
  expect(screen.getByRole('button')).toHaveStyle({ borderWidth: 1 });
});

test('caller style is applied last', () => {
  render(<Toggle style={{ opacity: 0.2 }}>Bold</Toggle>);
  expect(screen.getByRole('button')).toHaveStyle({ opacity: 0.2 });
});

test('render function gets props and state; ref reaches the host', () => {
  const ref = createRef<View>();
  const renderFn = jest.fn((props: object, _state?: unknown) => <Pressable testID="custom" {...props} />);
  render(
    <Toggle ref={ref} render={renderFn} defaultPressed>
      Bold
    </Toggle>,
  );
  expect(renderFn.mock.calls[0][1]).toEqual({ on: true, pressed: false, disabled: false });
  expect(ref.current).not.toBeNull();
});

test('render element form keeps role and tracks touch state', () => {
  render(<Toggle render={<Pressable testID="el" />}>Bold</Toggle>);
  const el = screen.getByTestId('el');
  expect(el.props.accessibilityRole).toBe('button');
  fireEvent(el, 'pressIn');
  fireEvent.press(el);
  expect(el).toBeSelected();
});
