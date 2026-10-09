import { createRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { mergeProps, mergeRefs, renderElement } from '@/registry/marcn/lib/render';

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

test('children always come from ours when ours defines them', () => {
  const merged = mergeProps({ children: 'ours' }, { children: 'theirs' });
  expect(merged.children).toBe('ours');
  expect(mergeProps({}, { children: 'theirs' }).children).toBe('theirs');
});

test('props the element sets to undefined do not wipe ours', () => {
  const merged = mergeProps({ disabled: true, accessibilityLabel: 'a' }, { disabled: undefined });
  expect(merged.disabled).toBe(true);
  expect(merged.accessibilityLabel).toBe('a');
});

test('element function style stays a function and resolves with the host state, after ours', () => {
  const merged = mergeProps(
    { style: { margin: 1, padding: 1 } },
    { style: ({ pressed }: { pressed: boolean }) => ({ margin: pressed ? 5 : 2 }) },
  );
  expect(typeof merged.style).toBe('function');
  expect(StyleSheet.flatten(merged.style({ pressed: true }))).toEqual({ margin: 5, padding: 1 });
  expect(StyleSheet.flatten(merged.style({ pressed: false }))).toEqual({ margin: 2, padding: 1 });
});

test('merged ref keeps its identity across calls with the same refs', () => {
  const a = jest.fn();
  const b = createRef<unknown>();
  expect(mergeRefs(a, b)).toBe(mergeRefs(a, b));
  expect(mergeProps({ ref: a }, { ref: b }).ref).toBe(mergeProps({ ref: a }, { ref: b }).ref);
});

test('merged ref runs cleanup functions returned by callback refs and nulls the others', () => {
  const cleanup = jest.fn();
  const withCleanup = jest.fn(() => cleanup);
  const plain = jest.fn();
  const objRef = createRef<unknown>();
  const merged = mergeRefs(withCleanup, plain) as (node: unknown) => () => void;
  const detach = merged('node');
  expect(withCleanup).toHaveBeenCalledWith('node');
  detach();
  expect(cleanup).toHaveBeenCalledTimes(1);
  expect(withCleanup).toHaveBeenCalledTimes(1);
  expect(plain).toHaveBeenLastCalledWith(null);
  const mergedObj = mergeRefs(plain, objRef) as (node: unknown) => () => void;
  mergedObj('n')();
  expect(objRef.current).toBeNull();
});

test('handlers listed in `always` still run when the element prevents the event', () => {
  const ours = jest.fn();
  const other = jest.fn();
  const merged = mergeProps({ onPressOut: ours, onPress: other }, { onPressOut: () => {}, onPress: () => {} }, ['onPressOut']);
  merged.onPressOut({ defaultPrevented: true });
  merged.onPress({ defaultPrevented: true });
  expect(ours).toHaveBeenCalledTimes(1);
  expect(other).not.toHaveBeenCalled();
});
