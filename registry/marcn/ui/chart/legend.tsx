import { StyleSheet, View, type ViewProps } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';
import { useChart } from '@/registry/marcn/ui/chart/context';

export type ChartLegendProps = ViewProps & { keys?: string[] };

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: t.spacing[4], paddingTop: t.spacing[3] },
    item: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    swatch: { width: 8, height: 8, borderRadius: 2 },
  });

export function ChartLegend({ keys, style, ...props }: ChartLegendProps) {
  const s = useStyles(createStyles);
  const { config, colors } = useChart();
  return (
    <View style={[s.root, style]} {...props}>
      {(keys ?? Object.keys(config)).map((key) => (
        <View key={key} style={s.item} accessible accessibilityLabel={config[key]?.label ?? key}>
          <View style={[s.swatch, { backgroundColor: colors[key] }]} />
          <Text variant="muted">{config[key]?.label ?? key}</Text>
        </View>
      ))}
    </View>
  );
}
