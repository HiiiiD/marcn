import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from '@/registry/marcn/lib/theme';
import { resolveChartColors, type ChartConfig } from '@/registry/marcn/ui/chart/config';

export function useChartColors(config: ChartConfig): Record<string, string> {
  const { colors } = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return useMemo(() => resolveChartColors(config, colors, scheme), [config, colors, scheme]);
}
