import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useStyles, useTheme } from '@/registry/marcn/lib/theme';
import { CollapsibleTrigger, useCollapsible, type CollapsibleTriggerProps } from '@/registry/marcn/ui/collapsible';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/accordion/styles';

export type AccordionTriggerProps = Omit<CollapsibleTriggerProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; children?: ReactNode };

export function AccordionTrigger({ children, style, ...props }: AccordionTriggerProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const { open, disabled } = useCollapsible();
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.triggerText}>
      <CollapsibleTrigger style={[s.layout.trigger, disabled && s.layout.disabled, style]} {...props}>
        {content}
        <Icon icon={ChevronDown} color={colors.mutedForeground} style={open ? s.layout.rotated : undefined} />
      </CollapsibleTrigger>
    </TextStyleContext.Provider>
  );
}
