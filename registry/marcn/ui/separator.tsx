import { StyleSheet, View, type ViewProps } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';

export type SeparatorProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
};

const createStyles = (t: Theme) =>
  StyleSheet.create({
    horizontal: { height: 1, alignSelf: 'stretch', backgroundColor: t.colors.border },
    vertical: { width: 1, alignSelf: 'stretch', backgroundColor: t.colors.border },
  });

export function Separator({ orientation = 'horizontal', decorative = true, style, ...props }: SeparatorProps) {
  const s = useStyles(createStyles);
  return (
    <View
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      style={[s[orientation], style]}
      {...props}
    />
  );
}
