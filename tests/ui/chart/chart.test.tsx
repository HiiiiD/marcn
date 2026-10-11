import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ChartContainer, ChartLegend, chartTooltip, useChart, type ChartConfig } from '@/registry/marcn/ui/chart';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';

const mockChart = jest.fn((_props: Record<string, unknown>) => null);
jest.mock('@tanstack/charts/react-native', () => ({ Chart: (props: Record<string, unknown>) => mockChart(props) }));
jest.mock('@tanstack/charts/react-native/tooltip', () => ({ tooltip: { id: 'native-tooltip' } }));

const config: ChartConfig = {
  desktop: { label: 'Desktop', color: 'chart1' },
  mobile: { label: 'Mobile', color: '#00ff00' },
};

beforeEach(() => mockChart.mockClear());

test('passes chart props through with defaults and the built definition', () => {
  const definition = { marks: [] };
  render(<ChartContainer config={config} definition={definition as never} accessibilityLabel="Visitors" />);
  const props = mockChart.mock.calls[0][0];
  expect(props).toMatchObject({ accessibilityLabel: 'Visitors', height: 220, definition, color: lightColors.mutedForeground });
});

test('definition builder receives resolved colors and a color scale', () => {
  const build = jest.fn((_ctx: unknown) => ({ marks: [] }));
  render(<ChartContainer config={config} definition={build as never} accessibilityLabel="x" height={100} />);
  expect(build).toHaveBeenCalledWith(
    expect.objectContaining({
      colors: { desktop: lightColors.chart1, mobile: '#00ff00' },
      color: { domain: ['desktop', 'mobile'], range: [lightColors.chart1, '#00ff00'] },
    }),
  );
  expect(mockChart.mock.calls[0][0]).toMatchObject({ height: 100 });
});

test('dark scheme resolves dark tokens', () => {
  const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default as jest.Mock;
  useColorScheme.mockReturnValue('dark');
  const build = jest.fn((_ctx: unknown) => ({ marks: [] }));
  render(<ChartContainer config={config} definition={build as never} accessibilityLabel="x" />);
  expect(build).toHaveBeenCalledWith(expect.objectContaining({ colors: expect.objectContaining({ desktop: darkColors.chart1 }) }));
  expect(mockChart.mock.calls[0][0]).toMatchObject({ color: darkColors.mutedForeground });
});

test('ChartLegend lists config labels with swatches, optionally filtered', () => {
  render(
    <ChartContainer config={config} definition={{ marks: [] } as never} accessibilityLabel="x">
      <ChartLegend />
      <ChartLegend keys={['mobile']} />
    </ChartContainer>,
  );
  expect(screen.getAllByText('Desktop')).toHaveLength(1);
  expect(screen.getAllByText('Mobile')).toHaveLength(2);
});

test('useChart throws outside the container and exposes config inside', () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const Probe = () => <Text>{Object.keys(useChart().config).join(',')}</Text>;
  expect(() => render(<Probe />)).toThrow('useChart must be used within <ChartContainer>');
  spy.mockRestore();
  render(
    <ChartContainer config={config} definition={{ marks: [] } as never} accessibilityLabel="x">
      <Probe />
    </ChartContainer>,
  );
  expect(screen.getByText('desktop,mobile')).toBeOnTheScreen();
});

test('chartTooltip maps series labels and marks the primary row', () => {
  const t = chartTooltip(config);
  expect(t.use).toEqual({ id: 'native-tooltip' });
  const a = { group: 'desktop', groupLabel: 'desktop', xValue: 'Jan', yValue: 5, color: '#a' };
  const b = { group: null, groupLabel: '', xValue: 'Jan', yValue: 7, color: '#b' };
  const ctx = { primaryPoint: a, formatX: (v: unknown) => `x${v}`, formatY: (v: unknown) => `y${v}`, yLabel: 'Value' };
  expect(t.content([a, b] as never, ctx as never)).toEqual({
    title: 'xJan',
    rows: [
      { label: 'Desktop', value: 'y5', color: '#a', active: true },
      { label: 'Value', value: 'y7', color: '#b', active: false },
    ],
  });
});

test('chartTooltip options override defaults', () => {
  expect(chartTooltip(config, { sticky: true }).sticky).toBe(true);
});
