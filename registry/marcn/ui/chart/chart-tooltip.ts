import { tooltip } from '@tanstack/charts/react-native/tooltip';
import type { ChartPoint, ChartTooltipContentContext, ChartTooltipOptions } from '@tanstack/charts/types';
import type { ChartConfig } from '@/registry/marcn/ui/chart/config';

export function chartTooltip(config: ChartConfig, options: ChartTooltipOptions<any, any, any> = {}) {
  return {
    use: tooltip,
    content: (points: readonly ChartPoint<any, any, any>[], ctx: ChartTooltipContentContext) => {
      const primary = ctx.primaryPoint ?? points[0];
      return {
        title: primary ? ctx.formatX(primary.xValue) : undefined,
        rows: points.map((p) => ({
          label: config[String(p.group)]?.label ?? (p.groupLabel || ctx.yLabel),
          value: ctx.formatY(p.yValue),
          color: p.color,
          active: p === primary,
        })),
      };
    },
    ...options,
  };
}
