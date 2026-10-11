import { CollapsibleContent, type CollapsibleContentProps } from '@/registry/marcn/ui/collapsible';
import { useStyles } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';
import { createStyles } from '@/registry/marcn/ui/accordion/styles';

export function AccordionContent({ children, style, ...props }: CollapsibleContentProps) {
  const s = useStyles(createStyles);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.contentText}>
      <CollapsibleContent style={[s.layout.content, style]} {...props}>
        {content}
      </CollapsibleContent>
    </TextStyleContext.Provider>
  );
}
