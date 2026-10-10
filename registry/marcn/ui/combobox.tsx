import { createContext, Fragment, useCallback, useContext, useRef, type ReactNode, type Ref } from 'react';
import {
  ScrollView, StyleSheet, View, type LayoutChangeEvent, type ScrollViewProps, type StyleProp, type ViewProps, type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Check, ChevronsUpDown, Search } from 'lucide-react-native';
import type { ComboboxFilter, ComboboxItemInput, ComboboxOption } from '@/registry/marcn/lib/combobox-filter';
import { ComboboxContext, useCombobox, useComboboxState, type ComboboxStateOptions } from '@/registry/marcn/lib/combobox-state';
import { MenuItemRow, type MenuItemRowProps } from '@/registry/marcn/lib/menu-item';
import { Overlay } from '@/registry/marcn/lib/overlay';
import { OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps, type OverlayTriggerProps } from '@/registry/marcn/lib/overlay-root';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { splitAnchored, useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import { Icon } from '@/registry/marcn/ui/icon';
import { Input, type InputProps } from '@/registry/marcn/ui/input';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

export type { ComboboxFilter, ComboboxItemInput, ComboboxOption };

const MIN_WIDTH = 200;

const createStyles = (t: Theme) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: t.spacing[2],
      paddingHorizontal: t.spacing[3],
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.input,
    },
    default: { height: 36 },
    sm: { height: 32 },
    disabled: { opacity: 0.5 },
    value: { flexShrink: 1, fontSize: t.fontSize.sm },
    placeholder: { color: t.colors.mutedForeground },
    surface: {
      position: 'absolute',
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.border,
      backgroundColor: t.colors.popover,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing[2],
      paddingHorizontal: t.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: t.colors.border,
    },
    input: { flex: 1, height: 40, borderWidth: 0, paddingHorizontal: 0, fontSize: t.fontSize.sm },
    list: { flexGrow: 0, flexShrink: 1, maxHeight: 300 },
    listContent: { padding: t.spacing[1] },
    empty: { paddingVertical: t.spacing[6], textAlign: 'center', fontSize: t.fontSize.sm },
  });

export type ComboboxProps = OverlayRootProps &
  Omit<ComboboxStateOptions, 'multiple' | 'value' | 'defaultValue' | 'onValueChange' | keyof OverlayRootProps> &
  (
    | { multiple?: false; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void }
    | { multiple: true; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

export function Combobox({ children, ...options }: ComboboxProps) {
  const ctx = useComboboxState(options);
  return (
    <OverlayRoot open={ctx.open} onOpenChange={ctx.setOpen}>
      <ComboboxContext.Provider value={ctx}>{children}</ComboboxContext.Provider>
    </OverlayRoot>
  );
}

export type ComboboxTriggerProps = Omit<OverlayTriggerProps, 'style' | 'children'> & {
  size?: 'default' | 'sm';
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ComboboxTrigger({ size = 'default', style, disabled, children, ...props }: ComboboxTriggerProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  const { open } = useOverlay();
  const isDisabled = disabled || combobox.disabled;
  return (
    <OverlayTrigger
      accessibilityRole="combobox"
      accessibilityState={{ expanded: open, disabled: !!isDisabled }}
      disabled={isDisabled}
      style={[s.trigger, s[size], isDisabled && s.disabled, style]}
      {...props}
    >
      {children}
      <Icon icon={ChevronsUpDown} color={colors.mutedForeground} />
    </OverlayTrigger>
  );
}

export type ComboboxValueProps = Omit<TextProps, 'children'> & {
  placeholder?: string;
  children?: (selected: ComboboxOption[]) => ReactNode;
};

export function ComboboxValue({ placeholder, style, children, ...props }: ComboboxValueProps) {
  const s = useStyles(createStyles);
  const { selected } = useCombobox();
  if (children) return <>{children(selected)}</>;
  const empty = selected.length === 0;
  return (
    <Text numberOfLines={1} style={[s.value, empty && s.placeholder, style]} {...props}>
      {empty ? placeholder : selected.map((o) => o.label).join(', ')}
    </Text>
  );
}

export type ComboboxContentProps = ViewProps & AnchoredOptions & { dismissable?: boolean; ref?: Ref<View> };

export function ComboboxContent({ dismissable, ...props }: ComboboxContentProps) {
  const combobox = useCombobox();
  return (
    <Overlay modal scrim={false} dismissable={dismissable}>
      <ComboboxContext.Provider value={combobox}>
        <ComboboxSurface {...props} />
      </ComboboxContext.Provider>
    </Overlay>
  );
}

function ComboboxSurface({ style, onLayout, ...rest }: Omit<ComboboxContentProps, 'dismissable'>) {
  const [anchored, props] = splitAnchored(rest, { side: 'bottom', align: 'start' });
  const s = useStyles(createStyles);
  const { open, triggerRef } = useOverlay();
  const pos = useAnchoredPosition(open, triggerRef, anchored);
  return (
    <Animated.View
      {...props}
      onLayout={(e: LayoutChangeEvent) => {
        pos.onLayout(e);
        onLayout?.(e);
      }}
      style={[s.surface, pos.style, { width: Math.max(MIN_WIDTH, pos.anchor?.width ?? 0), maxHeight: pos.maxHeight }, style]}
    />
  );
}

export type ComboboxInputProps = InputProps;

export function ComboboxInput({ style, placeholder, onChangeText, onSubmitEditing, ...props }: ComboboxInputProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  return (
    <View style={s.inputRow}>
      <Icon icon={Search} color={colors.mutedForeground} />
      <Input
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        // Stays focused on a miss (closing after a pick dismisses the keyboard). Gboard hides itself on "done".
        submitBehavior="submit"
        returnKeyType="search"
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        value={combobox.query}
        onChangeText={(text) => {
          combobox.setQuery(text);
          onChangeText?.(text);
        }}
        onSubmitEditing={(e) => {
          onSubmitEditing?.(e);
          combobox.submit();
        }}
        style={[s.input, style]}
        {...props}
      />
    </View>
  );
}

const ScrollContext = createContext<((node: View) => void) | null>(null);

export type ComboboxListProps<T extends ComboboxOption = ComboboxOption> = Omit<ScrollViewProps, 'children'> & {
  children?: (item: T, index: number) => ReactNode;
  ref?: Ref<ScrollView>;
};

export function ComboboxList<T extends ComboboxOption = ComboboxOption>({
  children, style, contentContainerStyle, ref, ...props
}: ComboboxListProps<T>) {
  const s = useStyles(createStyles);
  const { filtered } = useCombobox();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);

  const scrollIntoView = useCallback((node: View) => {
    const content = contentRef.current;
    if (!content) return;
    node.measureLayout(content, (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: false }), () => {});
  }, []);

  if (filtered.length === 0) return null;
  return (
    <ScrollView
      ref={mergeRefs(ref, scrollRef)}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      bounces={false}
      style={[s.list, style]}
      contentContainerStyle={[s.listContent, contentContainerStyle]}
      {...props}
    >
      <View ref={contentRef} collapsable={false}>
        <ScrollContext.Provider value={scrollIntoView}>
          {filtered.map((item, index) => (
            <Fragment key={item.value}>
              {children ? children(item as T, index) : <ComboboxItem value={item.value} disabled={item.disabled} />}
            </Fragment>
          ))}
        </ScrollContext.Provider>
      </View>
    </ScrollView>
  );
}

export type ComboboxItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant'> & { value: string };

export function ComboboxItem({ value, children, ref, onLayout, accessibilityState, ...props }: ComboboxItemProps) {
  const combobox = useCombobox();
  const scrollIntoView = useContext(ScrollContext);
  const rowRef = useRef<View>(null);
  const scrolled = useRef(false);
  const selected = combobox.isSelected(value);
  const first = combobox.selected[0]?.value === value;
  return (
    <MenuItemRow
      ref={mergeRefs(ref, rowRef)}
      role="option"
      accessibilityState={{ ...accessibilityState, selected }}
      indicator={selected ? <Icon icon={Check} /> : null}
      indicatorSide="end"
      onLayout={(e) => {
        onLayout?.(e);
        // Once per mount, and only for the unfiltered list: a long list opens on the current choice.
        if (first && !scrolled.current && !combobox.query && rowRef.current && scrollIntoView) {
          scrolled.current = true;
          scrollIntoView(rowRef.current);
        }
      }}
      onPress={() => combobox.select(value)}
      {...props}
    >
      {children ?? combobox.labelOf(value)}
    </MenuItemRow>
  );
}

export function ComboboxEmpty({ style, ...props }: TextProps) {
  const s = useStyles(createStyles);
  const { filtered } = useCombobox();
  if (filtered.length > 0) return null;
  return <Text accessibilityLiveRegion="polite" style={[s.empty, style]} {...props} />;
}
