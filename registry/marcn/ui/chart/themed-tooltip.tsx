import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  createChartTooltipContent,
  orderChartTooltipPoints,
  resolveChartTooltipAnchor,
  resolveChartTooltipPlacement,
} from '@tanstack/charts/tooltip/model';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text } from '@/registry/marcn/ui/text';

const createStyles = (t: Theme) =>
  StyleSheet.create({
    root: {
      position: 'absolute',
      zIndex: 1,
      maxWidth: '80%',
      minWidth: 112,
      gap: t.spacing[1],
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2],
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radius.md,
      backgroundColor: t.colors.popover,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[2] },
    swatch: { width: 9, height: 9, borderRadius: 2 },
    label: { flexGrow: 1, flexShrink: 1, color: t.colors.mutedForeground, fontSize: t.fontSize.xs },
    value: { color: t.colors.popoverForeground, fontSize: t.fontSize.xs, fontVariant: ['tabular-nums'] },
    title: { color: t.colors.popoverForeground, fontSize: t.fontSize.xs, fontWeight: t.fontWeight.medium },
    active: { fontWeight: t.fontWeight.bold },
  });

// Mirrors the library's native tooltip, whose wrapper card is hard-coded white and cannot be themed.
function ThemedTooltip(props: any) {
  const { scene, width, height, points: unordered, pointer, focusSource, options, pinned } = props;
  const s = useStyles(createStyles);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const points = useMemo(() => orderChartTooltipPoints(unordered, scene, options?.sort), [options?.sort, scene, unordered]);
  const primary = unordered[0];
  if (!primary) return null;

  const content = createChartTooltipContent(points, scene, pinned, options, primary);
  const sceneAnchor = resolveChartTooltipAnchor(primary, points, scene, pointer, options, {
    primary,
    group: unordered,
    source: focusSource,
    pinned,
  });
  const anchor = { x: (sceneAnchor.x / scene.width) * width, y: (sceneAnchor.y / scene.height) * height };
  const { left, top } = resolveChartTooltipPlacement(
    anchor,
    size,
    { left: 0, top: 0, right: width, bottom: height },
    options?.placement,
    options?.offset,
  );
  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout;
    if (next.width !== size.width || next.height !== size.height) setSize({ width: next.width, height: next.height });
  };
  const rows = typeof content === 'string' ? [] : content.rows;
  const title = typeof content === 'string' ? content : content.title;
  const label = [title, ...rows.map((r) => `${r.label}: ${r.value}`)].filter(Boolean).join('\n');

  return (
    <View
      accessibilityLabel={label}
      accessibilityLiveRegion={pinned ? 'none' : 'polite'}
      onLayout={onLayout}
      onStartShouldSetResponder={() => pinned}
      pointerEvents={pinned ? 'auto' : 'none'}
      style={[s.root, { left, top }]}
    >
      {title ? <Text style={s.title}>{title}</Text> : null}
      {rows.map((row, i) => (
        <View key={`${row.label}:${i}`} style={s.row}>
          <View style={[s.swatch, { backgroundColor: row.color ?? 'transparent' }]} />
          <Text numberOfLines={1} style={[s.label, row.active && s.active]}>
            {row.label}
          </Text>
          <Text numberOfLines={1} style={[s.value, row.active && s.active]}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export const themedTooltip = {
  id: 'marcn-chart-tooltip',
  __chartExtensionType: 'tooltip',
  __chartTooltipHost: 'react-native',
  create: () => ThemedTooltip,
} as never;
