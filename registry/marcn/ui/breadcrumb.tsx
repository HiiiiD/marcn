import { useState, type ReactNode, type Ref } from 'react';
import { I18nManager, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { ChevronRight, Ellipsis } from 'lucide-react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, TextStyleContext, type TextProps } from '@/registry/marcn/ui/text';

export type BreadcrumbLinkState = { pressed: boolean };
export type BreadcrumbLinkProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  render?: RenderProp<PressableProps, BreadcrumbLinkState>;
  ref?: Ref<View>;
};

const createStyles = (t: Theme) => ({
  view: StyleSheet.create({
    list: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.spacing[2] },
    item: { flexDirection: 'row', alignItems: 'center', gap: t.spacing[1] },
    ellipsis: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  }),
  text: StyleSheet.create({
    link: { fontSize: t.fontSize.sm, color: t.colors.mutedForeground },
    pressed: { fontSize: t.fontSize.sm, color: t.colors.foreground },
    page: { fontSize: t.fontSize.sm, color: t.colors.foreground },
  }),
});

const flip = () => (I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined);

export function Breadcrumb(props: ViewProps & { ref?: Ref<View> }) {
  return <View role="navigation" accessibilityLabel="breadcrumb" {...props} />;
}

export function BreadcrumbList({ style, ...props }: ViewProps & { ref?: Ref<View> }) {
  const s = useStyles(createStyles);
  return <View style={[s.view.list, style]} {...props} />;
}

export function BreadcrumbItem({ style, ...props }: ViewProps & { ref?: Ref<View> }) {
  const s = useStyles(createStyles);
  return <View style={[s.view.item, style]} {...props} />;
}

export function BreadcrumbLink({ style, render, children, onPressIn, onPressOut, ...props }: BreadcrumbLinkProps) {
  const s = useStyles(createStyles);
  const [pressed, setPressed] = useState(false);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={pressed ? s.text.pressed : s.text.link}>
      {renderElement(
        Pressable,
        render,
        {
          accessibilityRole: 'link',
          style,
          ...props,
          onPressIn: (e) => {
            setPressed(true);
            onPressIn?.(e);
          },
          onPressOut: (e) => {
            setPressed(false);
            onPressOut?.(e);
          },
          children: content,
        } as PressableProps,
        { pressed },
        ['onPressIn', 'onPressOut'],
      )}
    </TextStyleContext.Provider>
  );
}

export function BreadcrumbPage({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  return <Text accessibilityRole="text" accessibilityState={{ selected: true }} style={[s.text.page, style]} {...props} />;
}

export function BreadcrumbSeparator({ children, ...props }: ViewProps & { children?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" {...props}>
      {children ?? <Icon icon={ChevronRight} size={14} color={colors.mutedForeground} style={flip()} />}
    </View>
  );
}

export function BreadcrumbEllipsis({ style, ...props }: ViewProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel="More" style={[s.view.ellipsis, style]} {...props}>
      <Icon icon={Ellipsis} size={16} color={colors.mutedForeground} />
    </View>
  );
}
