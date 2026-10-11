import { chartColorScale, resolveChartColors } from '@/registry/marcn/ui/chart/config';
import { darkColors, lightColors } from '@/registry/marcn/lib/theme';

test('resolves theme tokens, literals and per-scheme overrides', () => {
  const config = {
    a: { color: 'chart2' },
    b: { color: '#123456' },
    c: { theme: { light: 'chart1', dark: '#abcdef' } },
  };
  expect(resolveChartColors(config, lightColors, 'light')).toEqual({
    a: lightColors.chart2,
    b: '#123456',
    c: lightColors.chart1,
  });
  expect(resolveChartColors(config, darkColors, 'dark')).toEqual({
    a: darkColors.chart2,
    b: '#123456',
    c: '#abcdef',
  });
});

test('series without a color cycle through chart1..chart5', () => {
  const config = Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map((k) => [k, {}]));
  const colors = resolveChartColors(config, lightColors, 'light');
  expect(colors.a).toBe(lightColors.chart1);
  expect(colors.e).toBe(lightColors.chart5);
  expect(colors.f).toBe(lightColors.chart1);
});

test('chartColorScale returns aligned domain and range', () => {
  expect(chartColorScale({ a: '#111', b: '#222' })).toEqual({ domain: ['a', 'b'], range: ['#111', '#222'] });
});
