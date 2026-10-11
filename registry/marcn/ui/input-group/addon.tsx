import { Pressable } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { useGroup } from '@/registry/marcn/ui/input-group/context';
import { createStyles } from '@/registry/marcn/ui/input-group/styles';
import type { InputGroupAddonProps } from '@/registry/marcn/ui/input-group/types';

export function InputGroupAddon({ align = 'inline-start', style, children, onPress, ...props }: InputGroupAddonProps) {
  const s = useStyles(createStyles);
  const group = useGroup('InputGroupAddon');
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.text.muted}>
      <Pressable
        accessible={false}
        style={[s.addon.base, s.addon[align], style]}
        {...props}
        onPress={(e) => {
          group.controlRef.current?.focus();
          onPress?.(e);
        }}
      >
        {content}
      </Pressable>
    </TextStyleContext.Provider>
  );
}
