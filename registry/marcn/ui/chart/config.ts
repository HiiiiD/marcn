import type { Colors } from '@/registry/marcn/lib/theme';

export type ChartConfigItem = {
  label?: string;
  /** A literal color or a theme token name such as `chart1`. */
  color?: string;
  theme?: { light: string; dark: string };
};

export type ChartConfig = Record<string, ChartConfigItem>;

const fallbackTokens = ['chart1', 'chart2', 'chart3', 'chart4', 'chart5'] as const;

export function resolveChartColors(
  config: ChartConfig,
  colors: Colors,
  scheme: 'light' | 'dark',
): Record<string, string> {
  const out: Record<string, string> = {};
  Object.keys(config).forEach((key, i) => {
    const raw = config[key].theme?.[scheme] ?? config[key].color ?? fallbackTokens[i % fallbackTokens.length];
    out[key] = raw in colors ? colors[raw as keyof Colors] : raw;
  });
  return out;
}

export function chartColorScale(colors: Record<string, string>) {
  const domain = Object.keys(colors);
  return { domain, range: domain.map((key) => colors[key]) };
}
