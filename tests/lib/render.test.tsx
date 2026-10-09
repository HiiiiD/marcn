import { createRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { mergeProps, renderElement } from '@/registry/marcn/lib/render';

test('falls back to the default component', () => {
  render(renderElement(View, undefined, { testID: 'host' }));
  expect(screen.getByTestId('host')).toBeOnTheScreen();
});

test('function form receives props and state, empty state by default', () => {
  const fn = jest.fn((props: object) => <View {...props} />);
  render(renderElement(View, fn, { testID: 'a' }, { pressed: true }));
  expect(fn).toHaveBeenCalledWith({ testID: 'a' }, { pressed: true });
  fn.mockClear();
  render(renderElement(View, fn, { testID: 'b' }));
  expect(fn).toHaveBeenCalledWith({ testID: 'b' }, {});
});

test('element form clones the element; element props win over ours', () => {
  render(
    renderElement(
      View,
      <View testID="el" accessibilityLabel="theirs" />,
      { accessibilityLabel: 'ours', accessibilityHint: 'hint' },
    ),
  );
  const el = screen.getByTestId('el');
  expect(el).toHaveProp('accessibilityLabel', 'theirs');
  expect(el).toHaveProp('accessibilityHint', 'hint');
});

test('style: element style comes after ours (array and object inputs)', () => {
  const merged = mergeProps({ style: [{ margin: 1 }, { padding: 1 }] }, { style: { margin: 2 } });
  expect(StyleSheet.flatten(merged.style)).toEqual({ margin: 2, padding: 1 });
});

test('style: only one side defined', () => {
  expect(StyleSheet.flatten(mergeProps({ style: { margin: 1 } }, {}).style)).toEqual({ margin: 1 });
  expect(StyleSheet.flatten(mergeProps({}, { style: { margin: 2 } }).style)).toEqual({ margin: 2 });
});

test("handlers compose: element first, then ours; return value is the element handler's", () => {
  const calls: string[] = [];
  const merged = mergeProps(
    { onPress: () => calls.push('ours') },
    { onPress: () => { calls.push('theirs'); return 'r'; } },
  );
  expect(merged.onPress({})).toBe('r');
  expect(calls).toEqual(['theirs', 'ours']);
});

test.each([
  ['defaultPrevented flag', { defaultPrevented: true }],
  ['isDefaultPrevented()', { isDefaultPrevented: () => true }],
])('handler composition skips ours when the event is prevented (%s)', (_name, event) => {
  const ours = jest.fn();
  const theirs = jest.fn();
  mergeProps({ onPress: ours }, { onPress: theirs }).onPress(event);
  expect(theirs).toHaveBeenCalledTimes(1);
  expect(ours).not.toHaveBeenCalled();
});

test('handler only on one side is kept; undefined element handler keeps ours', () => {
  const ours = jest.fn();
  expect(mergeProps({ onPress: ours }, {}).onPress).toBe(ours);
  expect(mergeProps({ onPress: ours }, { onPress: undefined }).onPress).toBe(ours);
  const theirs = jest.fn();
  expect(mergeProps({}, { onPress: theirs }).onPress).toBe(theirs);
});

test('refs: callback and object refs both receive the node', () => {
  const fnRef = jest.fn();
  const objRef = createRef<unknown>();
  mergeProps({ ref: fnRef }, { ref: objRef }).ref('node');
  expect(fnRef).toHaveBeenCalledWith('node');
  expect(objRef.current).toBe('node');
});

test('single ref is passed through untouched', () => {
  const fnRef = jest.fn();
  expect(mergeProps({ ref: fnRef }, {}).ref).toBe(fnRef);
});

test('refs reach the real host through renderElement', () => {
  const ours = createRef<View>();
  const theirs = createRef<View>();
  render(renderElement(View, <View ref={theirs} testID="x" />, { ref: ours }));
  expect(ours.current).not.toBeNull();
  expect(theirs.current).toBe(ours.current);
});
