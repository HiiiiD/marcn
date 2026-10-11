import { StyleSheet } from 'react-native';
import { areaY, barY, defineChart, lineY } from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, chartTooltip, type ChartConfig } from '@/components/ui/chart';
import { Section } from './Section';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const desktop = [186, 305, 237, 73, 209, 214];
const mobile = [80, 200, 120, 190, 130, 140];

const rows = months.flatMap((month, i) => [
  { month, series: 'desktop', value: desktop[i] },
  { month, series: 'mobile', value: mobile[i] },
]);

const browsers = [
  { browser: 'chrome', visitors: 275 },
  { browser: 'safari', visitors: 200 },
  { browser: 'firefox', visitors: 187 },
  { browser: 'edge', visitors: 173 },
];

const visitorsConfig: ChartConfig = {
  desktop: { label: 'Desktop', color: 'chart1' },
  mobile: { label: 'Mobile', color: 'chart2' },
};

const browserConfig: ChartConfig = {
  chrome: { label: 'Chrome', color: 'chart1' },
  safari: { label: 'Safari', color: 'chart2' },
  firefox: { label: 'Firefox', color: 'chart3' },
  edge: { label: 'Edge', color: 'chart4' },
};

const yScale = { scale: scaleLinear, nice: true, grid: true } as const;

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent style={styles.content}>{children}</CardContent>
    </Card>
  );
}

function BarChart() {
  return (
    <ChartCard title="Bar chart" description="Stacked visitors, January - June">
      <ChartContainer
        config={visitorsConfig}
        accessibilityLabel="Stacked bar chart of desktop and mobile visitors per month"
        definition={({ config, color }) =>
          defineChart({
            marks: [barY(rows, { x: 'month', y: 'value', color: 'series', radius: 3 })],
            scales: { x: { scale: () => scaleBand().padding(0.25) }, y: yScale },
            color: { ...color },
            tooltip: chartTooltip(config),
          })
        }
      >
        <ChartLegend />
      </ChartContainer>
    </ChartCard>
  );
}

function LineChart() {
  return (
    <ChartCard title="Line chart" description="Visitors per month">
      <ChartContainer
        config={visitorsConfig}
        accessibilityLabel="Line chart of desktop and mobile visitors per month"
        definition={({ config, color }) =>
          defineChart({
            marks: [lineY(rows, { x: 'month', y: 'value', color: 'series', points: true })],
            scales: { x: { scale: () => scalePoint<string>().padding(0.2) }, y: yScale },
            color: { ...color },
            tooltip: chartTooltip(config),
          })
        }
      >
        <ChartLegend />
      </ChartContainer>
    </ChartCard>
  );
}

function AreaChart() {
  return (
    <ChartCard title="Area chart" description="Stacked visitors, January - June">
      <ChartContainer
        config={visitorsConfig}
        accessibilityLabel="Stacked area chart of desktop and mobile visitors per month"
        definition={({ config, color }) =>
          defineChart({
            marks: [areaY(rows, { x: 'month', y: 'value', color: 'series', fillOpacity: 0.7 })],
            scales: { x: { scale: () => scalePoint<string>().padding(0.1) }, y: yScale },
            color: { ...color },
            tooltip: chartTooltip(config),
          })
        }
      >
        <ChartLegend />
      </ChartContainer>
    </ChartCard>
  );
}

function PieChart() {
  const slices = pie(browsers, { value: 'visitors' });
  return (
    <ChartCard title="Pie chart" description="Visitors by browser">
      <ChartContainer
        config={browserConfig}
        height={240}
        accessibilityLabel="Donut chart of visitors by browser"
        definition={({ color }) =>
          defineChart({
            marks: [
              polar({
                inset: 8,
                radiusRatio: 0.9,
                marks: [
                  radialArc(slices, { innerRadius: ({ radius }) => radius * 0.55, cornerRadius: 4, color: 'browser', key: 'browser' }),
                ],
                scales: { angle: null, radius: null },
              }),
            ],
            scales: { x: null, y: null },
            color: { ...color },
          })
        }
      >
        <ChartLegend />
      </ChartContainer>
    </ChartCard>
  );
}

export function Charts() {
  return (
    <Section title="Chart">
      <BarChart />
      <LineChart />
      <AreaChart />
      <PieChart />
    </Section>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 0 },
});
