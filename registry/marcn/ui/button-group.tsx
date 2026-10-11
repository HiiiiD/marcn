import { Children, cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { renderElement, type RenderProp } from '@/registry/marcn/lib/render';
import { useStyles, type Theme } from '@/registry/marcn/lib/theme';
import { Separator, type SeparatorProps } from '@/registry/marcn/ui/separator';
import { Text, TextStyleContext } from '@/registry/marcn/ui/text';

type Orientation = 'horizontal' | 'vertical';
type Position = 'first' | 'middle' | 'last';
type Joinable = ReactElement<{ style?: StyleProp<ViewStyle> }>;

export type ButtonGroupProps = ViewProps & { orientation?: Orientation; ref?: Ref<View> };
export type ButtonGroupTextProps = ViewProps & { render?: RenderProp<ViewProps>; ref?: Ref<View> };

const createStyles = (t: Theme) => {
  const noEnd = { borderTopEndRadius: 0, borderBottomEndRadius: 0 } as const;
  const noStart = { borderTopStartRadius: 0, borderBottomStartRadius: 0 } as const;
  const noBottom = { borderBottomStartRadius: 0, borderBottomEndRadius: 0 } as const;
  const noTop = { borderTopStartRadius: 0, borderTopEndRadius: 0 } as const;
  return {
    group: StyleSheet.create({
      horizontal: { flexDirection: 'row', alignSelf: 'flex-start' },
      vertical: { flexDirection: 'column', alignSelf: 'flex-start' },
    }),
    join: {
      horizontal: StyleSheet.create({
        first: { ...noEnd },
        middle: { ...noEnd, ...noStart, borderStartWidth: 0 },
        last: { ...noStart, borderStartWidth: 0 },
      }),
      vertical: StyleSheet.create({
        first: { ...noBottom },
        middle: { ...noBottom, ...noTop, borderTopWidth: 0 },
        last: { ...noTop, borderTopWidth: 0 },
      }),
    },
    text: StyleSheet.create({
      box: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing[2],
        height: 36,
        paddingHorizontal: t.spacing[4],
        borderWidth: 1,
        borderColor: t.colors.border,
        borderRadius: t.radius.md,
        backgroundColor: t.colors.muted,
      },
      label: { fontSize: t.fontSize.sm, fontWeight: t.fontWeight.medium, color: t.colors.foreground },
    }),
  };
};

const isJoinable = (child: unknown): child is Joinable => isValidElement(child) && child.type !== ButtonGroupSeparator;

export function ButtonGroup({ orientation = 'horizontal', style, children, ...props }: ButtonGroupProps) {
  const s = useStyles(createStyles);
  const items = Children.toArray(children);
  const total = items.filter(isJoinable).length;
  let seen = -1;
  const joined = items.map((child) => {
    if (typeof child === 'string' || typeof child === 'number') return <Text key={child}>{child}</Text>;
    if (typeof child === 'string' || typeof child === 'number') return <Text key={`text-${child}`}>{child}</Text>;
    if (!isJoinable(child)) return child;
    seen += 1;
    if (total < 2) return child;
    const position: Position = seen === 0 ? 'first' : seen === total - 1 ? 'last' : 'middle';
    return cloneElement(child, { style: [child.props.style, s.join[orientation][position]] });
  });
  return (
    <View role="group" style={[s.group[orientation], style]} {...props}>
      {joined}
    </View>
  );
}

export function ButtonGroupText({ style, render, children, ...props }: ButtonGroupTextProps) {
  const s = useStyles(createStyles);
  const content = typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children;
  return (
    <TextStyleContext.Provider value={s.text.label}>
      {renderElement(View, render, { style: [s.text.box, style], ...props, children: content } as ViewProps)}
    </TextStyleContext.Provider>
  );
}

export function ButtonGroupSeparator({ orientation = 'vertical', style, ...props }: SeparatorProps) {
  return <Separator orientation={orientation} style={[orientation === 'vertical' ? { marginVertical: 1 } : { marginHorizontal: 1 }, style]} {...props} />;
}
