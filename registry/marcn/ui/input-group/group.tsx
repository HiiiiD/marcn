import { useMemo, useRef, useState } from 'react';
import { View, type TextInput } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { GroupContext } from '@/registry/marcn/ui/input-group/context';
import { createStyles } from '@/registry/marcn/ui/input-group/styles';
import type { InputGroupProps } from '@/registry/marcn/ui/input-group/types';

export function InputGroup({ disabled = false, style, ...props }: InputGroupProps) {
  const s = useStyles(createStyles);
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const controlRef = useRef<TextInput>(null);
  const value = useMemo(() => ({ disabled, controlRef, setFocused, setInvalid }), [disabled]);
  return (
    <GroupContext.Provider value={value}>
      <View
        role="group"
        style={[s.group.root, focused && s.group.focused, invalid && s.group.invalid, disabled && s.group.disabled, style]}
        {...props}
      />
    </GroupContext.Provider>
  );
}
