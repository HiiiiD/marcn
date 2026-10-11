import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';
import { OtpCaret } from '@/registry/marcn/ui/input-otp/caret';
import { useOtp } from '@/registry/marcn/ui/input-otp/context';
import { activeSlot } from '@/registry/marcn/ui/input-otp/state';
import { createStyles } from '@/registry/marcn/ui/input-otp/styles';
import type { InputOTPSlotState } from '@/registry/marcn/ui/input-otp/types';

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
