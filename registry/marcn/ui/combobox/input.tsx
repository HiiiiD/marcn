import { useContext, useState, type Ref } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { ComboboxClear } from '@/registry/marcn/ui/combobox/clear';
import { FieldContext, PopupContext, useCombobox } from '@/registry/marcn/ui/combobox/context';
import { createFieldStyles, useComboboxInputProps, type ComboboxFieldProps } from '@/registry/marcn/ui/combobox/input-props';
import { ComboboxTrigger } from '@/registry/marcn/ui/combobox/trigger';

export type ComboboxInputProps = TextInputProps &
  ComboboxFieldProps & {
    showTrigger?: boolean;
    showClear?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    ref?: Ref<TextInput>;
  };

export function ComboboxInput({
  showTrigger, showClear, containerStyle, style, onBlur, 'aria-invalid': invalid, disabled, ref, ...rest
}: ComboboxInputProps) {
  const s = useStyles(createFieldStyles);
  const combobox = useCombobox();
  const inPopup = useContext(PopupContext);
  const [focused, setFocused] = useState(false);
  const { off, props } = useComboboxInputProps({ ...rest, disabled, ref, onFocus: (e) => { setFocused(true); rest.onFocus?.(e); } });
  const hasContent = combobox.selected.length > 0 || combobox.inputValue !== '';
  return (
    <View
      ref={inPopup ? undefined : combobox.anchorRef}
      testID="combobox-anchor"
      onLayout={inPopup ? undefined : combobox.bumpAnchor}
      style={[s.field, inPopup && s.inPopup, focused && s.focused, invalid === true && s.invalid, off && s.disabled, containerStyle]}
    >
      <TextInput
        autoFocus={inPopup}
        {...props}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[s.input, style]}
      />
      <FieldContext.Provider value>
        {showClear && hasContent ? <ComboboxClear disabled={off} /> : null}
        {(showTrigger ?? !inPopup) ? <ComboboxTrigger disabled={off} /> : null}
      </FieldContext.Provider>
    </View>
  );
}
