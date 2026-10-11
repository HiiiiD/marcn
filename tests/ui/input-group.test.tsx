import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { TextInput, View } from 'react-native';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/registry/marcn/ui/input-group';
import { lightColors } from '@/registry/marcn/lib/theme';

test('group owns the border and the control is borderless', () => {
  render(
    <InputGroup testID="g">
      <InputGroupInput testID="i" />
    </InputGroup>,
  );
  expect(screen.getByTestId('g')).toHaveStyle({ borderWidth: 1, borderColor: lightColors.input, flexDirection: 'row', flexWrap: 'wrap' });
  expect(screen.getByTestId('i')).toHaveStyle({ borderWidth: 0, flex: 1 });
});

test('focusing the control paints the ring and blur removes it; caller handlers still run', () => {
  const onFocus = jest.fn();
  const onBlur = jest.fn();
  render(
    <InputGroup testID="g">
      <InputGroupInput testID="i" onFocus={onFocus} onBlur={onBlur} />
    </InputGroup>,
  );
  fireEvent(screen.getByTestId('i'), 'focus');
  expect(screen.getByTestId('g')).toHaveStyle({ borderColor: lightColors.ring });
  expect(onFocus).toHaveBeenCalledTimes(1);
  fireEvent(screen.getByTestId('i'), 'blur');
  expect(screen.getByTestId('g')).toHaveStyle({ borderColor: lightColors.input });
  expect(onBlur).toHaveBeenCalledTimes(1);
});

test('aria-invalid on the control paints the destructive border and clears on unmount', () => {
  const { rerender } = render(
    <InputGroup testID="g">
      <InputGroupInput aria-invalid />
    </InputGroup>,
  );
  expect(screen.getByTestId('g')).toHaveStyle({ borderColor: lightColors.destructive });
  rerender(<InputGroup testID="g" />);
  expect(screen.getByTestId('g')).toHaveStyle({ borderColor: lightColors.input });
});

test('disabled group dims itself and disables the control', () => {
  render(
    <InputGroup testID="g" disabled>
      <InputGroupInput testID="i" />
    </InputGroup>,
  );
  expect(screen.getByTestId('g')).toHaveStyle({ opacity: 0.5 });
  expect(screen.getByTestId('i').props.editable).toBe(false);
});

test('textarea control joins the group the same way', () => {
  render(
    <InputGroup testID="g">
      <InputGroupTextarea testID="t" />
    </InputGroup>,
  );
  fireEvent(screen.getByTestId('t'), 'focus');
  expect(screen.getByTestId('g')).toHaveStyle({ borderColor: lightColors.ring });
  expect(screen.getByTestId('t').props.multiline).toBe(true);
});

test('pressing a non-button addon focuses the control', () => {
  const ref = createRef<TextInput>();
  render(
    <InputGroup>
      <InputGroupAddon testID="addon">
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput ref={ref} />
    </InputGroup>,
  );
  const focus = jest.spyOn(ref.current!, 'focus');
  fireEvent.press(screen.getByTestId('addon'));
  expect(focus).toHaveBeenCalledTimes(1);
});

test('pressing an addon with no control mounted does not crash', () => {
  render(
    <InputGroup>
      <InputGroupAddon testID="addon" />
    </InputGroup>,
  );
  fireEvent.press(screen.getByTestId('addon'));
});

test('addon string children are muted text; block addons take the full width', () => {
  render(
    <InputGroup>
      <InputGroupAddon testID="blk" align="block-end">
        hint
      </InputGroupAddon>
    </InputGroup>,
  );
  expect(screen.getByText('hint')).toHaveStyle({ color: lightColors.mutedForeground });
  expect(screen.getByTestId('blk')).toHaveStyle({ width: '100%' });
});

test('InputGroupButton is ghost by default, sized by the size prop, and presses', () => {
  const onPress = jest.fn();
  render(
    <>
      <InputGroupButton testID="x" onPress={onPress}>Go</InputGroupButton>
      <InputGroupButton testID="i" size="icon-xs" />
      <InputGroupButton testID="s" size="sm">Go</InputGroupButton>
    </>,
  );
  expect(screen.getByTestId('x')).toHaveStyle({ height: 24 });
  expect(screen.getByTestId('i')).toHaveStyle({ height: 24, width: 24 });
  expect(screen.getByTestId('s')).toHaveStyle({ height: 32 });
  fireEvent.press(screen.getByTestId('x'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('controls throw a clear error outside a group', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<InputGroupInput />)).toThrow('InputGroupInput must be used within <InputGroup>');
  jest.restoreAllMocks();
});

test('group ref reaches the view', () => {
  const ref = createRef<View>();
  render(<InputGroup ref={ref} />);
  expect(ref.current).not.toBeNull();
});
