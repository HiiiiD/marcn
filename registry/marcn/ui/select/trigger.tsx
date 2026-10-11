import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { OverlayTrigger, useOverlay, type OverlayTriggerProps } from '@/registry/marcn/ui/overlay/overlay-root';
import { useStyles, useTheme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, type TextProps } from '@/registry/marcn/ui/text';
import { useSelect } from '@/registry/marcn/ui/select/context';
import { createStyles } from '@/registry/marcn/ui/select/styles';

export type SelectTriggerProps = Omit<OverlayTriggerProps, 'style' | 'children'> & {
  size?: 'default' | 'sm';
  children?: ReactNode;
  'aria-invalid'?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SelectTrigger({ size = 'default', style, disabled, children, 'aria-invalid': ariaInvalid, ...props }: SelectTriggerProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const select = useSelect();
  const { open } = useOverlay();
  const isDisabled = disabled || select.disabled;
  return (
    <OverlayTrigger
      accessibilityRole="combobox"
      accessibilityState={{ expanded: open, disabled: !!isDisabled }}
      disabled={isDisabled}
      style={[s.trigger, s[size], ariaInvalid === true && s.invalid, isDisabled && s.disabled, style]}
      {...props}
    >
      {children}
      <Icon icon={ChevronDown} color={colors.mutedForeground} />
    </OverlayTrigger>
  );
}

export function SelectValue({ placeholder, style, ...props }: TextProps & { placeholder?: string }) {
  const s = useStyles(createStyles);
  const { value, labels } = useSelect();
  const empty = value === undefined || value === '';
  const text = empty ? placeholder : (labels[value] ?? value);
  return (
    <Text numberOfLines={1} style={[s.value, empty && s.placeholder, style]} {...props}>
      {text}
    </Text>
  );
}
