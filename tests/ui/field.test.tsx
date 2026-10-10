import { createRef } from 'react';
import { Text as RNText, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { lightColors } from '@/registry/marcn/lib/theme';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  useField,
} from '@/registry/marcn/ui/field';

test('renders label, description and error', () => {
  render(
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <FieldDescription>We never share it</FieldDescription>
      <FieldError message="Required" />
    </Field>,
  );
  expect(screen.getByText('Email')).toBeOnTheScreen();
  expect(screen.getByText('We never share it')).toHaveStyle({ color: lightColors.mutedForeground });
  expect(screen.getByRole('alert')).toHaveTextContent('Required');
  expect(screen.getByText('Required')).toHaveStyle({ color: lightColors.destructive });
});

test('label turns destructive when invalid', () => {
  render(
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
    </Field>,
  );
  expect(screen.getByText('Email')).toHaveStyle({ color: lightColors.destructive });
});

test('label dims when field disabled, explicit prop wins', () => {
  render(
    <Field disabled>
      <FieldLabel>A</FieldLabel>
      <FieldLabel disabled={false}>B</FieldLabel>
    </Field>,
  );
  expect(screen.getByText('A')).toHaveStyle({ opacity: 0.5 });
  expect(screen.getByText('B')).not.toHaveStyle({ opacity: 0.5 });
});

test('error renders nothing without content', () => {
  render(
    <Field>
      <FieldError />
      <FieldError message="" />
    </Field>,
  );
  expect(screen.queryByRole('alert')).toBeNull();
});

test('error children override message', () => {
  render(<FieldError message="a">b</FieldError>);
  expect(screen.getByText('b')).toBeOnTheScreen();
  expect(screen.queryByText('a')).toBeNull();
});

test('horizontal orientation lays out in a row', () => {
  render(<Field testID="f" orientation="horizontal" />);
  expect(screen.getByTestId('f')).toHaveStyle({ flexDirection: 'row' });
});

test('useField exposes state', () => {
  function Probe() {
    const { invalid, disabled } = useField();
    return <RNText>{`${invalid}-${disabled}`}</RNText>;
  }
  render(
    <Field invalid disabled>
      <Probe />
    </Field>,
  );
  expect(screen.getByText('true-true')).toBeOnTheScreen();
});

test('group, set and legend render', () => {
  render(
    <FieldGroup testID="g">
      <FieldSet testID="s">
        <FieldLegend>Plan</FieldLegend>
      </FieldSet>
    </FieldGroup>,
  );
  expect(screen.getByTestId('g')).toHaveStyle({ gap: 24 });
  expect(screen.getByTestId('s')).toBeOnTheScreen();
  expect(screen.getByRole('header')).toHaveTextContent('Plan');
});

test('render prop receives state and ref reaches host', () => {
  const ref = createRef<View>();
  const fn = jest.fn((props: object, state: { invalid: boolean; disabled: boolean }) => (
    <View {...props} testID={`s-${state.invalid}`} />
  ));
  render(<Field ref={ref} invalid render={fn} />);
  expect(screen.getByTestId('s-true')).toBeOnTheScreen();
  expect(ref.current).not.toBeNull();
});

test('element render form keeps its props', () => {
  render(<Field render={<View testID="custom" />} />);
  expect(screen.getByTestId('custom')).toBeOnTheScreen();
});
