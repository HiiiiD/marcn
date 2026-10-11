import { useMemo, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Chart, type ChartProps } from '@tanstack/charts/react-native';
import type { ChartDefinition } from '@tanstack/charts/types';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { chartColorScale, type ChartConfig } from '@/registry/marcn/ui/chart/config';
import { ChartContext } from '@/registry/marcn/ui/chart/context';
import { useChartColors } from '@/registry/marcn/ui/chart/use-chart-colors';

type AnyDefinition = ChartDefinition<any, any, any>;

export type ChartBuildContext = {
  config: ChartConfig;
  /** Resolved color per config key. */
  colors: Record<string, string>;
  /** `{ domain, range }` for the chart-level `color` option. */
  color: { domain: string[]; range: string[] };
};

export type ChartContainerProps = Omit<ChartProps, 'definition' | 'style'> & {
  config: ChartConfig;
  definition: AnyDefinition | ((context: ChartBuildContext) => AnyDefinition);
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

const createStyles = (t: Theme) => StyleSheet.create({ root: { width: '100%', gap: t.spacing[0] } });

// Chart infers its generics from the definition; the container is definition-agnostic.
const UntypedChart = Chart as ComponentType<any>;

export function ChartContainer({
  config,
  definition,
  height = 220,
  style,
  children,
  ...props
}: ChartContainerProps) {
  const s = useStyles(createStyles);
  const { colors: theme } = useTheme();
  const colors = useChartColors(config);
  const resolved = useMemo(
    () => (typeof definition === 'function' ? definition({ config, colors, color: chartColorScale(colors) }) : definition),
    [definition, config, colors],
  );
  const value = useMemo(() => ({ config, colors }), [config, colors]);
  return (
    <ChartContext.Provider value={value}>
      <View style={[s.root, style]}>
        <UntypedChart color={theme.mutedForeground} focusFill={theme.background} height={height} {...props} definition={resolved} />
        {children}
      </View>
    </ChartContext.Provider>
  );
}
