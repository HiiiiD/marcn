import { useContext } from 'react';
import { Collapsible, type CollapsibleProps } from '@/registry/marcn/ui/collapsible';
import { useStyles } from '@/registry/marcn/lib/theme';
import { AccordionContext } from '@/registry/marcn/ui/accordion/context';
import { createStyles } from '@/registry/marcn/ui/accordion/styles';

export type AccordionItemProps = Omit<CollapsibleProps, 'open' | 'defaultOpen' | 'onOpenChange'> & { value: string };

export function AccordionItem({ value, disabled, style, ...props }: AccordionItemProps) {
  const s = useStyles(createStyles);
  const root = useContext(AccordionContext);
  if (!root) throw new Error('AccordionItem must be used within an Accordion');
  return (
    <Collapsible
      open={root.isOpen(value)}
      onOpenChange={(next) => root.toggle(value, next)}
      disabled={disabled || root.disabled}
      style={[s.layout.item, style]}
      {...props}
    />
  );
}
