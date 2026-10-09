import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

export type Colors = Record<
  | 'background' | 'foreground' | 'card' | 'cardForeground' | 'popover' | 'popoverForeground'
  | 'primary' | 'primaryForeground' | 'secondary' | 'secondaryForeground' | 'muted'
  | 'mutedForeground' | 'accent' | 'accentForeground' | 'destructive' | 'destructiveForeground'
  | 'border' | 'input' | 'ring',
  string
>;

export const lightColors: Colors = {
  background: '#ffffff',
  foreground: '#0a0a0a',
  card: '#ffffff',
  cardForeground: '#0a0a0a',
  popover: '#ffffff',
  popoverForeground: '#0a0a0a',
  primary: '#171717',
  primaryForeground: '#fafafa',
  secondary: '#f5f5f5',
  secondaryForeground: '#171717',
  muted: '#f5f5f5',
  mutedForeground: '#737373',
  accent: '#f5f5f5',
  accentForeground: '#171717',
  destructive: '#e7000b',
  destructiveForeground: '#fafafa',
  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#a1a1a1',
};

export const darkColors: Colors = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#171717',
  cardForeground: '#fafafa',
  popover: '#171717',
  popoverForeground: '#fafafa',
  primary: '#e5e5e5',
  primaryForeground: '#171717',
  secondary: '#262626',
  secondaryForeground: '#fafafa',
  muted: '#262626',
  mutedForeground: '#a1a1a1',
  accent: '#262626',
  accentForeground: '#fafafa',
  destructive: '#ff6467',
  destructiveForeground: '#fafafa',
  border: 'rgba(255,255,255,0.1)',
  input: 'rgba(255,255,255,0.15)',
  ring: '#737373',
};

export const radius = { xs: 4, sm: 6, md: 8, lg: 10, xl: 14, full: 9999 } as const;
export const spacing = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 } as const;
export const fontSize = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 } as const;
export const fontWeight = { normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800' } as const;

export type Theme = {
  colors: Colors;
  radius: typeof radius;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
};

const lightTheme: Theme = { colors: lightColors, radius, spacing, fontSize, fontWeight };
const darkTheme: Theme = { colors: darkColors, radius, spacing, fontSize, fontWeight };

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

// `create` must be a stable module-level function, otherwise the memo never hits.
export function useStyles<T>(create: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => create(theme), [create, theme]);
}
