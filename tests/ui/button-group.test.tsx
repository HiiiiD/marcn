import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';
import { Text as RNText, View } from 'react-native';
import { Button } from '@/registry/marcn/ui/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/registry/marcn/ui/button-group';
import { lightColors } from '@/registry/marcn/lib/theme';

const hidden = { includeHiddenElements: true };

const three = (orientation?: 'horizontal' | 'vertical') => (
  <ButtonGroup testID="group" orientation={orientation}>
    <Button testID="a" variant="outline">A</Button>
    <Button testID="b" variant="outline">B</Button>
    <Button testID="c" variant="outline">C</Button>
  </ButtonGroup>
);

test('horizontal group is a row group and joins children', () => {
  render(three());
  expect(screen.getByTestId('group')).toHaveStyle({ flexDirection: 'row' });
  expect(screen.getByTestId('a')).toHaveStyle({ borderTopEndRadius: 0, borderBottomEndRadius: 0 });
  expect(screen.getByTestId('a')).not.toHaveStyle({ borderStartWidth: 0 });
  expect(screen.getByTestId('b')).toHaveStyle({
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
    borderTopEndRadius: 0,
    borderBottomEndRadius: 0,
    borderStartWidth: 0,
  });
  expect(screen.getByTestId('c')).toHaveStyle({ borderTopStartRadius: 0, borderBottomStartRadius: 0, borderStartWidth: 0 });
  expect(screen.getByTestId('c')).not.toHaveStyle({ borderTopEndRadius: 0 });
});

test('vertical group is a column and joins on the block axis', () => {
  render(three('vertical'));
  expect(screen.getByTestId('group')).toHaveStyle({ flexDirection: 'column' });
  expect(screen.getByTestId('a')).toHaveStyle({ borderBottomStartRadius: 0, borderBottomEndRadius: 0 });
  expect(screen.getByTestId('b')).toHaveStyle({ borderTopWidth: 0, borderTopStartRadius: 0, borderTopEndRadius: 0 });
  expect(screen.getByTestId('c')).toHaveStyle({ borderTopWidth: 0, borderTopStartRadius: 0, borderTopEndRadius: 0 });
});

test('a single child is untouched', () => {
  render(
    <ButtonGroup>
      <Button testID="only" variant="outline">A</Button>
    </ButtonGroup>,
  );
  expect(screen.getByTestId('only')).toHaveStyle({ borderRadius: 8 });
  expect(screen.getByTestId('only')).not.toHaveStyle({ borderTopEndRadius: 0 });
});

test('separators are skipped when joining and count positions without them', () => {
  render(
    <ButtonGroup>
      <Button testID="a" variant="outline">A</Button>
      <ButtonGroupSeparator testID="sep" />
      <Button testID="b" variant="outline">B</Button>
    </ButtonGroup>,
  );
  expect(screen.getByTestId('a')).toHaveStyle({ borderTopEndRadius: 0 });
  expect(screen.getByTestId('b')).toHaveStyle({ borderTopStartRadius: 0, borderStartWidth: 0 });
  expect(screen.getByTestId('sep', hidden)).toHaveStyle({ width: 1 });
});

test('non-element children and fragments do not crash', () => {
  render(
    <ButtonGroup testID="g">
      {null}
      text
      <>
        <Button testID="f" variant="outline">F</Button>
      </>
    </ButtonGroup>,
  );
  expect(screen.getByTestId('f')).toBeOnTheScreen();
});

test('child style is kept and join wins on radius', () => {
  render(
    <ButtonGroup>
      <Button testID="a" style={{ marginTop: 5 }}>A</Button>
      <Button testID="b">B</Button>
    </ButtonGroup>,
  );
  expect(screen.getByTestId('a')).toHaveStyle({ marginTop: 5, borderTopEndRadius: 0 });
});

test('group style and ref reach the view', () => {
  const ref = createRef<View>();
  render(<ButtonGroup ref={ref} testID="g" style={{ marginTop: 3 }} />);
  expect(screen.getByTestId('g')).toHaveStyle({ marginTop: 3 });
  expect(ref.current).not.toBeNull();
});

test('ButtonGroupText wraps strings, looks like an outline button and joins', () => {
  render(
    <ButtonGroup>
      <ButtonGroupText testID="t">https://</ButtonGroupText>
      <Button testID="b" variant="outline">Go</Button>
    </ButtonGroup>,
  );
  expect(screen.getByText('https://')).toHaveStyle({ color: lightColors.foreground });
  expect(screen.getByTestId('t')).toHaveStyle({ borderWidth: 1, borderTopEndRadius: 0 });
});

test('ButtonGroupText render element keeps the group style', () => {
  render(<ButtonGroupText render={<View testID="el" />}>x</ButtonGroupText>);
  expect(screen.getByTestId('el')).toHaveStyle({ borderWidth: 1 });
  expect(screen.getByText('x')).toBeOnTheScreen();
});

test('ButtonGroupText accepts non-string children', () => {
  render(
    <ButtonGroupText>
      <RNText>raw</RNText>
    </ButtonGroupText>,
  );
  expect(screen.getByText('raw')).toBeOnTheScreen();
});

test('ButtonGroupSeparator defaults to vertical and honors orientation', () => {
  const { rerender } = render(<ButtonGroupSeparator testID="s" />);
  expect(screen.getByTestId('s', hidden)).toHaveStyle({ width: 1 });
  rerender(<ButtonGroupSeparator testID="s" orientation="horizontal" />);
  expect(screen.getByTestId('s', hidden)).toHaveStyle({ height: 1 });
});
