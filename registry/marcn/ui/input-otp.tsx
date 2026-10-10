import { createContext, useContext, useReducer, useState, type ReactNode, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewProps } from 'react-native';
import { OtpCaret } from '@/registry/marcn/lib/otp-caret';
import { activeSlot, DIGIT, sanitizeOtp } from '@/registry/marcn/lib/otp-state';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Text } from '@/registry/marcn/ui/text';

export type InputOTPState = { value: string; focused: boolean; disabled: boolean; invalid: boolean; complete: boolean };
export type InputOTPSlotState = { char: string; active: boolean; filled: boolean; focused: boolean; invalid: boolean; disabled: boolean };

type OtpContextValue = { value: string; maxLength: number; focused: boolean; disabled: boolean; invalid: boolean };
const OtpContext = createContext<OtpContextValue | null>(null);

function useOtp() {
  const ctx = useContext(OtpContext);
  if (!ctx) throw new Error('InputOTPSlot must be used within InputOTP');
  return ctx;
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    input: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, color: 'transparent', backgroundColor: 'transparent', opacity: 0.011 },
    group: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    slot: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.input,
      borderRadius: t.radius.md,
    },
    active: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
    char: { fontSize: t.fontSize.base, color: t.colors.foreground },
    separator: { width: t.spacing[2], height: 2, borderRadius: 1, backgroundColor: t.colors.mutedForeground },
  });

export type InputOTPProps = Omit<ViewProps, 'children'> &
  Pick<TextInputProps, 'onFocus' | 'onBlur' | 'autoFocus' | 'accessibilityLabel'> & {
    children?: ReactNode;
    maxLength: number;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    pattern?: RegExp;
    disabled?: boolean;
    'aria-invalid'?: boolean;
    inputRef?: Ref<TextInput>;
    render?: RenderProp<ViewProps, InputOTPState>;
    ref?: Ref<View>;
  };

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

export type InputOTPGroupProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function InputOTPGroup({ style, render, ...props }: InputOTPGroupProps) {
  const s = useStyles(createStyles);
  return renderElement(View, render, { style: [s.group, style], ...props } as ViewProps);
}

export type InputOTPSlotProps = ViewProps & {
  index: number;
  render?: RenderProp<ViewProps, InputOTPSlotState>;
  ref?: Ref<View>;
};

export function InputOTPSlot({ index, render, style, ...props }: InputOTPSlotProps) {
  const s = useStyles(createStyles);
  const { value, maxLength, focused, disabled, invalid } = useOtp();
  const char = value[index] ?? '';
  const active = focused && !disabled && index === activeSlot(value.length, maxLength);
  const state: InputOTPSlotState = { char, active, filled: char !== '', focused, invalid, disabled };
  return renderElement(
    View,
    render,
    {
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      style: [s.slot, active && s.active, invalid && s.invalid, disabled && s.disabled, style],
      ...props,
      children: (
        <>
          {char ? <Text style={s.char}>{char}</Text> : null}
          {active && !char ? <OtpCaret /> : null}
        </>
      ),
    } as ViewProps,
    state,
  );
}

export type InputOTPSeparatorProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function InputOTPSeparator({ style, render, ...props }: InputOTPSeparatorProps) {
  const s = useStyles(createStyles);
  return renderElement(View, render, {
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants',
    style: [s.separator, style],
    ...props,
  } as ViewProps);
}
