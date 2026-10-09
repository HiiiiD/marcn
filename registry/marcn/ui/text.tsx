import { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'large' | 'small' | 'muted';
export type TextProps = RNTextProps & { variant?: TextVariant };

export const TextStyleContext = createContext<TextStyle | undefined>(undefined);

const createStyles = (t: Theme) =>
  StyleSheet.create({
    base: { color: t.colors.foreground, fontSize: t.fontSize.base },
    h1: { fontSize: t.fontSize['4xl'], fontWeight: '800', lineHeight: 40 },
    h2: { fontSize: t.fontSize['3xl'], fontWeight: t.fontWeight.semibold, lineHeight: 36 },
    h3: { fontSize: t.fontSize['2xl'], fontWeight: t.fontWeight.semibold, lineHeight: 32 },
    h4: { fontSize: t.fontSize.xl, fontWeight: t.fontWeight.semibold, lineHeight: 28 },
    p: { lineHeight: 28 },
    lead: { fontSize: t.fontSize.xl, color: t.colors.mutedForeground, lineHeight: 28 },
    large: { fontSize: t.fontSize.lg, fontWeight: t.fontWeight.semibold },
    small: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, lineHeight: 14 },
    muted: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
  });

export function Text({ variant, style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const inherited = useContext(TextStyleContext);
  return <RNText style={[s.base, inherited, variant && s[variant], style]} {...props} />;
}
