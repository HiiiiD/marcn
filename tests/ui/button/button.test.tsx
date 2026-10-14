import { fireEvent, render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { Button, type ButtonState } from '@/registry/marcn/ui/button';
import { Text } from '@/registry/marcn/ui/text';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';
import { setScheme } from '../../scheme';

test('renders a button role and fires onPress', () => {
  const onPress = jest.fn();
  render(<Button onPress={onPress}><Text>Go</Text></Button>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test.each([
  ['default', lightColors.primary],
  ['destructive', lightColors.destructive],
  ['secondary', lightColors.secondary],
  ['outline', lightColors.background],
] as const)('%s variant background', (variant, bg) => {
  render(<Button variant={variant}><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: bg });
});

test.each([['default', 36], ['sm', 32], ['lg', 40]] as const)('%s size height', (size, h) => {
  render(<Button size={size}><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ height: h });
});

test('icon size is square', () => {
  render(<Button size="icon"><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ height: 36, width: 36 });
});

test('child Text inherits variant text color', () => {
  render(<Button><Text>Go</Text></Button>);
  expect(screen.getByText('Go')).toHaveStyle({ color: lightColors.primaryForeground });
});

test('non-string children (icon + text) both render and text inherits style', () => {
  render(
    <Button variant="destructive">
      <Text>icon</Text>
      <Text>label</Text>
    </Button>,
  );
  expect(screen.getByText('label')).toHaveStyle({ color: lightColors.destructiveForeground });
});

test('disabled blocks press and reports state', () => {
  const onPress = jest.fn();
  render(<Button disabled onPress={onPress}><Text>x</Text></Button>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toBeDisabled();
});

test('dark mode swaps the default background', () => {
  setScheme('dark');
  render(<Button><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: darkColors.primary });
});

test('style prop overrides', () => {
  render(<Button style={{ marginTop: 9 }}><Text>x</Text></Button>);
  expect(screen.getByRole('button')).toHaveStyle({ marginTop: 9 });
});

test('plain string children are wrapped in Text with the variant color', () => {
  render(<Button>Save</Button>);
  expect(screen.getByText('Save')).toHaveStyle({ color: lightColors.primaryForeground });
});

test('render element keeps role, variant style, onPress and wraps string children', () => {
  const onPress = jest.fn();
  render(<Button variant="outline" onPress={onPress} render={<Pressable testID="el" />}>Go</Button>);
  const el = screen.getByRole('button');
  expect(el).toHaveStyle({ backgroundColor: lightColors.background });
  fireEvent.press(el);
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByText('Go')).toHaveStyle({ color: lightColors.foreground });
});

test('render element: pressed style is applied via tracked pressIn/pressOut', () => {
  render(<Button variant="outline" render={<Pressable />}>Go</Button>);
  const el = screen.getByRole('button');
  fireEvent(el, 'pressIn');
  expect(el).toHaveStyle({ backgroundColor: lightColors.accent });
  fireEvent(el, 'pressOut');
  expect(el).toHaveStyle({ backgroundColor: lightColors.background });
});

test('render function receives props and pressed/disabled state', () => {
  const fn = jest.fn((props: PressableProps, _state: ButtonState) => <Pressable {...props} />);
  render(<Button render={fn}>Go</Button>);
  expect(fn).toHaveBeenLastCalledWith(expect.objectContaining({ accessibilityRole: 'button' }), { pressed: false, disabled: false });
  fireEvent(screen.getByRole('button'), 'pressIn');
  expect(fn).toHaveBeenLastCalledWith(expect.anything(), { pressed: true, disabled: false });
});

test('render path composes caller onPressIn with tracking', () => {
  const onPressIn = jest.fn();
  render(<Button onPressIn={onPressIn} render={<Pressable />}>Go</Button>);
  fireEvent(screen.getByRole('button'), 'pressIn');
  expect(onPressIn).toHaveBeenCalledTimes(1);
});

test('element onPress runs before the button onPress; preventDefault skips the button one', () => {
  const calls: string[] = [];
  render(
    <Button onPress={() => calls.push('button')} render={<Pressable onPress={() => calls.push('element')} />}>Go</Button>,
  );
  fireEvent.press(screen.getByRole('button'));
  expect(calls).toEqual(['element', 'button']);
  calls.length = 0;
  fireEvent.press(screen.getByRole('button'), { defaultPrevented: true });
  expect(calls).toEqual(['element']);
});

test('element onPress={undefined} does not wipe the button onPress', () => {
  const onPress = jest.fn();
  render(<Button onPress={onPress} render={<Pressable onPress={undefined} />}>Go</Button>);
  fireEvent.press(screen.getByRole('button'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('render path reports disabled in state and does not crash on a non-pressable host', () => {
  const fn = jest.fn((props: PressableProps, _state: ButtonState) => (
    <View testID="v" accessibilityRole={props.accessibilityRole}>{props.children as never}</View>
  ));
  render(<Button disabled render={fn}>Go</Button>);
  expect(fn).toHaveBeenLastCalledWith(expect.anything(), { pressed: false, disabled: true });
  expect(screen.getByTestId('v')).toBeOnTheScreen();
});

test('render element with a function style keeps variant style and applies the element style', () => {
  render(
    <Button variant="outline" render={<Pressable style={({ pressed }) => ({ marginTop: pressed ? 7 : 3 })} />}>Go</Button>,
  );
  expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: lightColors.background, marginTop: 3 });
});

test('pressed tracking still ends when the element prevents pressIn/pressOut', () => {
  const prevent = () => {};
  render(<Button variant="outline" render={<Pressable onPressIn={prevent} onPressOut={prevent} />}>Go</Button>);
  const el = screen.getByRole('button');
  fireEvent(el, 'pressIn', { defaultPrevented: true });
  expect(el).toHaveStyle({ backgroundColor: lightColors.accent });
  fireEvent(el, 'pressOut', { defaultPrevented: true });
  expect(el).toHaveStyle({ backgroundColor: lightColors.background });
});

test('element-form onPressIn composes with the tracking handler', () => {
  const calls: string[] = [];
  render(<Button variant="outline" onPressIn={() => calls.push('button')} render={<Pressable onPressIn={() => calls.push('element')} />}>Go</Button>);
  const el = screen.getByRole('button');
  fireEvent(el, 'pressIn');
  expect(calls).toEqual(['element', 'button']);
  expect(el).toHaveStyle({ backgroundColor: lightColors.accent });
});

test('disabled Button with an element render reports disabled and ignores press', () => {
  const onPress = jest.fn();
  render(<Button disabled onPress={onPress} render={<View testID="v" />}>Go</Button>);
  expect(screen.getByTestId('v')).toBeOnTheScreen();
  expect(screen.getByTestId('v')).toHaveProp('accessibilityState', { disabled: true });
});

test.each([['default path', undefined], ['render element path', <Pressable key="p" />]])('ref reaches the host (%s)', (_name, renderEl) => {
  const ref = createRef<View>();
  render(<Button ref={ref} render={renderEl}>Go</Button>);
  expect(ref.current).not.toBeNull();
});

test('ref passed to Button and to the rendered element both receive the host', () => {
  const ours = createRef<View>();
  const theirs = createRef<View>();
  render(<Button ref={ours} render={<Pressable ref={theirs} />}>Go</Button>);
  expect(ours.current).not.toBeNull();
  expect(theirs.current).toBe(ours.current);
});

test('link variant uses link role', () => {
  render(<Button variant="link"><Text>x</Text></Button>);
  expect(screen.getByRole('link')).toBeTruthy();
});

test('inline size has no height or padding', () => {
  render(<Button variant="link" size="inline"><Text>x</Text></Button>);
  const style = StyleSheet.flatten(screen.getByRole('link').props.style);
  expect(style.height).toBeUndefined();
  expect(style.paddingHorizontal).toBeUndefined();
});
