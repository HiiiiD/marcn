import { renderHook } from '@testing-library/react-native';
import { darkColors, fontWeight, lightColors, radius, useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { setScheme } from '../scheme';

test('useTheme returns light colors by default', () => {
  const { result } = renderHook(() => useTheme());
  expect(result.current.colors).toEqual(lightColors);
});

test('useTheme returns dark colors when scheme is dark', () => {
  setScheme('dark');
  const { result } = renderHook(() => useTheme());
  expect(result.current.colors).toEqual(darkColors);
});

test('useTheme keeps identity across renders', () => {
  const { result, rerender } = renderHook(() => useTheme());
  const first = result.current;
  rerender({});
  expect(result.current).toBe(first);
});

const create = (t: Theme) => ({ bg: t.colors.background });

test('useStyles memoizes and recomputes when scheme changes', () => {
  const { result, rerender } = renderHook(() => useStyles(create));
  const first = result.current;
  rerender({});
  expect(result.current).toBe(first);
  setScheme('dark');
  rerender({});
  expect(result.current.bg).toBe(darkColors.background);
});

test('light and dark define the same token keys', () => {
  expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
});

test('exposes xs radius and extrabold weight tokens', () => {
  expect(radius.xs).toBe(4);
  expect(fontWeight.extrabold).toBe('800');
});
