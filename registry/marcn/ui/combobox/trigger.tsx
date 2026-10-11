import { useContext, useEffect, type ReactNode, type Ref } from 'react';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, useTheme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { FieldContext, useCombobox } from '@/registry/marcn/ui/combobox/context';
import { createFieldStyles } from '@/registry/marcn/ui/combobox/input-props';

export type ComboboxTriggerProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  ref?: Ref<View>;
};

export function ComboboxTrigger({ disabled, onPress, style, children, ref, ...props }: ComboboxTriggerProps) {
  const s = useStyles(createFieldStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  const inField = useContext(FieldContext);
  const { setSearchInPopup } = combobox;
  const off = disabled || combobox.disabled;
  const toggle = () => {
    if (combobox.open) return combobox.setOpen(false);
    combobox.setOpen(true);
    if (inField) combobox.inputRef.current?.focus();
  };

  useEffect(() => {
    if (inField) return;
    setSearchInPopup(true);
    return () => setSearchInPopup(false);
  }, [inField, setSearchInPopup]);

  const chevron = <Icon icon={ChevronDown} color={colors.mutedForeground} />;
  if (inField) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel="Show options"
        accessibilityState={{ expanded: combobox.open, disabled: !!off }}
        disabled={off}
        hitSlop={6}
        style={({ pressed }) => [s.button, pressed && s.pressed, style]}
        {...props}
        onPress={(e) => {
          onPress?.(e);
          toggle();
        }}
      >
        {chevron}
      </Pressable>
    );
  }
  // Without an input to anchor to, the trigger is the anchor and the search box lives in the popup.
  return (
    <Pressable
      ref={mergeRefs(ref, combobox.anchorRef)}
      onLayout={combobox.bumpAnchor}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: combobox.open, disabled: !!off }}
      disabled={off}
      style={[s.field, s.trigger, combobox.open && s.focused, off && s.disabled, style]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        toggle();
      }}
    >
      {children}
      {chevron}
    </Pressable>
  );
}
