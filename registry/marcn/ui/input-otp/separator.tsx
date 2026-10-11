import type { Ref } from 'react';
import { View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles } from '@/registry/marcn/lib/theme';
import { createStyles } from '@/registry/marcn/ui/input-otp/styles';

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
