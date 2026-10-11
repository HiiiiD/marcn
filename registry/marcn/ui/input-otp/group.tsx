import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { createStyles } from '@/registry/marcn/ui/input-otp/styles';

export type InputOTPGroupProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

export function InputOTPGroup({ style, render, ...props }: InputOTPGroupProps) {
  const s = useStyles(createStyles);
  return renderElement(View, render, { style: [s.group, style], ...props } as ViewProps);
}
