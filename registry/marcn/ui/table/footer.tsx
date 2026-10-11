import { View, type ViewProps } from 'react-native';
import { useStyles } from '@/registry/marcn/lib/theme';
import { TextStyleContext } from '@/registry/marcn/ui/text';
import { RowGroup } from '@/registry/marcn/ui/table/row-group';
import { createStyles } from '@/registry/marcn/ui/table/styles';

export function TableFooter({ style, children, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  return (
    <View role="rowgroup" style={[s.footer, style]} {...props}>
      <TextStyleContext.Provider value={s.textMedium}>
        <RowGroup group="footer">{children}</RowGroup>
      </TextStyleContext.Provider>
    </View>
  );
}
