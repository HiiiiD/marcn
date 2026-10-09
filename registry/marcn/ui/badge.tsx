import { StyleSheet, View, type ViewProps } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type BadgeProps = ViewProps & { variant?: BadgeVariant; render?: RenderProp<ViewProps> };

const createStyles = (t: Theme) => {
  const text = { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.medium };
  return {
    root: StyleSheet.create({
      root: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing[1],
        borderRadius: t.radius.full,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingHorizontal: t.spacing[2],
        paddingVertical: 2,
      },
    }).root,
    variant: StyleSheet.create({
      default: { backgroundColor: t.colors.primary },
      secondary: { backgroundColor: t.colors.secondary },
      destructive: { backgroundColor: t.colors.destructive },
      outline: { borderColor: t.colors.border },
    }),
    text: StyleSheet.create({
      default: { ...text, color: t.colors.primaryForeground },
      secondary: { ...text, color: t.colors.secondaryForeground },
      destructive: { ...text, color: t.colors.destructiveForeground },
      outline: { ...text, color: t.colors.foreground },
    }),
  };
};

export function Badge({ variant = 'default', style, render, children, ...props }: BadgeProps) {
  const s = useStyles(createStyles);
  return (
    <TextStyleContext.Provider value={s.text[variant]}>
      {renderElement(View, render, {
        style: [s.root, s.variant[variant], style],
        ...props,
        children: typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children,
      } as ViewProps)}
    </TextStyleContext.Provider>
  );
}
