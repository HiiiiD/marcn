import { useReducer, useState } from 'react';
import { TextInput, View, type ViewProps } from 'react-native';
import { renderElement } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { OtpContext } from '@/registry/marcn/ui/input-otp/context';
import { DIGIT, sanitizeOtp } from '@/registry/marcn/ui/input-otp/state';
import { createStyles } from '@/registry/marcn/ui/input-otp/styles';
import type { InputOTPProps, InputOTPState } from '@/registry/marcn/ui/input-otp/types';

export function InputOTP({
  maxLength,
  value: valueProp,
  defaultValue,
  onChange,
  onComplete,
  pattern = DIGIT,
  disabled = false,
  'aria-invalid': ariaInvalid,
  autoFocus,
  accessibilityLabel,
  onFocus,
  onBlur,
  inputRef,
  render,
  style,
  children,
  ...props
}: InputOTPProps) {
  const s = useStyles(createStyles);
  const clean = (text: string | undefined) => sanitizeOtp(text ?? '', maxLength, pattern);
  const [value, setValue] = useControllableState({
    value: valueProp === undefined ? undefined : clean(valueProp),
    defaultValue: clean(defaultValue),
    onChange,
  });
  const [focused, setFocused] = useState(false);
  const [, resync] = useReducer((n: number) => n + 1, 0);
  const invalid = ariaInvalid === true;

  // A rejected edit leaves state unchanged, so force a render to push the controlled text back to the native input.
  const handleChange = (text: string) => {
    const next = clean(text);
    if (next === value) return resync();
    setValue(next);
    if (next.length === maxLength) onComplete?.(next);
  };

  const state: InputOTPState = { value, focused, disabled, invalid, complete: value.length === maxLength };
  const host = {
    style: [s.root, style],
    ...props,
    children: (
      <>
        {children}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          editable={!disabled}
          autoFocus={autoFocus}
          keyboardType={pattern === DIGIT ? 'number-pad' : 'default'}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          autoCorrect={false}
          autoCapitalize="none"
          caretHidden
          selectionColor="transparent"
          selection={{ start: value.length, end: value.length }}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={s.input}
        />
      </>
    ),
  } as ViewProps;

  return (
    <OtpContext.Provider value={{ value, maxLength, focused, disabled, invalid }}>
      {renderElement(View, render, host, state)}
    </OtpContext.Provider>
  );
}
