import { createRef } from 'react';
import { TextInput, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, type InputOTPProps } from '@/registry/marcn/ui/input-otp';

const hidden = { includeHiddenElements: true };

const Example = (props: Partial<InputOTPProps>) => (
  <InputOTP maxLength={6} accessibilityLabel="Code" {...props}>
    <InputOTPGroup>
      <InputOTPSlot index={0} testID="s0" />
      <InputOTPSlot index={1} testID="s1" />
      <InputOTPSlot index={2} testID="s2" />
    </InputOTPGroup>
    <InputOTPSeparator testID="sep" />
    <InputOTPGroup>
      <InputOTPSlot index={3} testID="s3" />
      <InputOTPSlot index={4} testID="s4" />
      <InputOTPSlot index={5} testID="s5" />
    </InputOTPGroup>
  </InputOTP>
);
const input = () => screen.getByLabelText('Code');
const type = (text: string) => fireEvent.changeText(input(), text);

test('typing fills slots', () => {
  render(<Example />);
  type('123');
  expect(screen.getByText('1', hidden)).toBeTruthy();
  expect(screen.getByText('3', hidden)).toBeTruthy();
  expect(input().props.value).toBe('123');
});

test('paste strips invalid chars and truncates', () => {
  const onChange = jest.fn();
  render(<Example onChange={onChange} />);
  type('12-34 5678');
  expect(onChange).toHaveBeenCalledWith('123456');
  expect(input().props.value).toBe('123456');
});

test('rejected char resets native text to state', () => {
  render(<Example defaultValue="12" />);
  type('12a');
  expect(input().props.value).toBe('12');
});

test('uncontrolled defaultValue is sanitized', () => {
  render(<Example defaultValue="1x2" />);
  expect(input().props.value).toBe('12');
});

test('controlled follows value and reports changes', () => {
  const onChange = jest.fn();
  const { rerender } = render(<Example value="12" onChange={onChange} />);
  type('123');
  expect(onChange).toHaveBeenCalledWith('123');
  expect(input().props.value).toBe('12');
  rerender(<Example value="123" onChange={onChange} />);
  expect(input().props.value).toBe('123');
});

test('onComplete fires once when full', () => {
  const onComplete = jest.fn();
  render(<Example onComplete={onComplete} />);
  type('12345');
  expect(onComplete).not.toHaveBeenCalled();
  type('123456');
  type('1234567');
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenCalledWith('123456');
});

test('digit pattern uses number-pad, custom pattern the default keyboard', () => {
  const { rerender } = render(<Example />);
  expect(input().props.keyboardType).toBe('number-pad');
  rerender(<Example pattern={/^[a-z]$/i} />);
  expect(input().props.keyboardType).toBe('default');
});

test('autofill hints', () => {
  render(<Example />);
  expect(input().props.textContentType).toBe('oneTimeCode');
  expect(input().props.autoComplete).toBe('sms-otp');
});

test('active slot follows focus and length', () => {
  const seen: Record<number, boolean> = {};
  const slot = (i: number) => (
    <InputOTPSlot
      key={i}
      index={i}
      render={(p, st) => {
        seen[i] = st.active;
        return <View {...p} />;
      }}
    />
  );
  render(<InputOTP maxLength={3} accessibilityLabel="Code">{[0, 1, 2].map(slot)}</InputOTP>);
  expect(seen).toEqual({ 0: false, 1: false, 2: false });
  fireEvent(input(), 'focus');
  expect(seen[0]).toBe(true);
  type('12');
  expect(seen).toMatchObject({ 0: false, 1: false, 2: true });
  type('123');
  expect(seen[2]).toBe(true);
  fireEvent(input(), 'blur');
  expect(seen[2]).toBe(false);
});

test('disabled: not editable', () => {
  render(<Example disabled />);
  expect(input().props.editable).toBe(false);
  expect(input().props.accessibilityState).toMatchObject({ disabled: true });
});

test('aria-invalid reaches slot state', () => {
  let invalid: boolean | undefined;
  render(
    <InputOTP maxLength={1} aria-invalid accessibilityLabel="Code">
      <InputOTPSlot
        index={0}
        render={(p, st) => {
          invalid = st.invalid;
          return <View {...p} />;
        }}
      />
    </InputOTP>,
  );
  expect(invalid).toBe(true);
});

test('slot outside root throws', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<InputOTPSlot index={0} />)).toThrow('InputOTPSlot must be used within InputOTP');
});

test('slot index beyond maxLength renders empty', () => {
  render(
    <InputOTP maxLength={2} defaultValue="12" accessibilityLabel="Code">
      <InputOTPSlot index={5} testID="x" />
    </InputOTP>,
  );
  expect(screen.getByTestId('x', hidden)).toBeTruthy();
});

test('separator renders', () => {
  render(<Example />);
  expect(screen.getByTestId('sep', hidden)).toBeTruthy();
});

test('root render element keeps slots and input', () => {
  render(<Example render={<View testID="host" />} />);
  expect(screen.getByTestId('host')).toBeTruthy();
  expect(input()).toBeTruthy();
});

test('root render function receives props and state', () => {
  const fn = jest.fn((p: any, _state?: any) => <View {...p} />);
  render(<Example defaultValue="123456" render={fn} />);
  expect(fn.mock.calls[0][1]).toMatchObject({ value: '123456', complete: true, focused: false, disabled: false, invalid: false });
});

test('slot render element keeps its char', () => {
  render(
    <InputOTP maxLength={1} defaultValue="7" accessibilityLabel="Code">
      <InputOTPSlot index={0} render={<View testID="custom" />} />
    </InputOTP>,
  );
  expect(screen.getByTestId('custom', hidden)).toBeTruthy();
  expect(screen.getByText('7', hidden)).toBeTruthy();
});

test('slot render function state', () => {
  const fn = jest.fn((p: any, _state?: any) => <View {...p} />);
  render(
    <InputOTP maxLength={2} defaultValue="7" accessibilityLabel="Code">
      <InputOTPSlot index={0} render={fn} />
    </InputOTP>,
  );
  expect(fn.mock.calls[0][1]).toMatchObject({ char: '7', filled: true, active: false });
});

test('refs: ref -> container, inputRef -> TextInput, slot ref -> slot', () => {
  const ref = createRef<View>();
  const inputRef = createRef<TextInput>();
  const slotRef = createRef<View>();
  render(
    <InputOTP maxLength={1} ref={ref} inputRef={inputRef} accessibilityLabel="Code">
      <InputOTPSlot index={0} ref={slotRef} />
    </InputOTP>,
  );
  expect(ref.current).not.toBeNull();
  expect(inputRef.current).not.toBeNull();
  expect(slotRef.current).not.toBeNull();
});

test('slots are hidden from accessibility, input is not', () => {
  render(<Example defaultValue="12" />);
  expect(screen.getByTestId('s0', hidden).props.accessibilityElementsHidden).toBe(true);
  expect(screen.getByLabelText('Code')).toBeTruthy();
});
