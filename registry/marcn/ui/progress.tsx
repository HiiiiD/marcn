import { StyleSheet, View, type ViewProps } from 'react-native';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';

export type ProgressProps = ViewProps & { value?: number };

const createStyles = (t: Theme) =>
  StyleSheet.create({
    track: { height: 8, overflow: 'hidden', borderRadius: t.radius.full, backgroundColor: t.colors.muted },
    indicator: { height: '100%', backgroundColor: t.colors.primary },
  });

export function Progress({ value, style, ...props }: ProgressProps) {
  const s = useStyles(createStyles);
  const pct = Number.isFinite(value) ? Math.min(100, Math.max(0, value as number)) : 0;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={[s.track, style]}
      {...props}
    >
      <View testID="progress-indicator" style={[s.indicator, { width: `${pct}%` }]} />
    </View>
  );
}
