import {
  createContext, Fragment, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState,
  type ReactNode, type Ref, type RefObject,
} from 'react';
import {
  Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View,
  type LayoutChangeEvent, type PressableProps, type ScrollViewProps, type StyleProp, type TextInputProps, type ViewProps, type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { useBackDismiss } from '@/registry/marcn/lib/back-stack';
import { MenuItemRow, MenuSeparator, type MenuItemRowProps } from '@/registry/marcn/lib/menu-item';
import { Portal } from '@/registry/marcn/lib/portal';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { splitAnchored, useAnchoredPosition, type AnchoredOptions } from '@/registry/marcn/lib/use-anchored-position';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { usePresence } from '@/registry/marcn/lib/use-presence';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, TextStyleContext, type TextProps } from '@/registry/marcn/ui/text';

export type ComboboxOption = { value: string; label: string; disabled?: boolean; keywords?: readonly string[] };
export type ComboboxItemInput = string | (Omit<ComboboxOption, 'label'> & { label?: string } & Record<string, unknown>);
export type ComboboxGroupInput = { value: string; items: readonly ComboboxItemInput[] };
export type ComboboxOptionGroup = { value: string; items: ComboboxOption[] };
export type ComboboxRow = ComboboxOption | ComboboxOptionGroup;
export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean;

export function toOption(item: ComboboxItemInput): ComboboxOption {
  return typeof item === 'string' ? { value: item, label: item } : { ...item, label: item.label ?? item.value };
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const defaultFilter: ComboboxFilter = (option, query) => {
  const q = fold(query.trim());
  return !q || [option.label, ...(option.keywords ?? [])].some((text) => fold(text).includes(q));
};

export function filterOptions(options: readonly ComboboxOption[], query: string, filter: ComboboxFilter | null = defaultFilter) {
  return filter ? options.filter((option) => filter(option, query)) : [...options];
}

const isGroupInput = (item: ComboboxItemInput | ComboboxGroupInput): item is ComboboxGroupInput =>
  typeof item !== 'string' && Array.isArray((item as { items?: unknown }).items);

export const isGroup = (row: ComboboxRow): row is ComboboxOptionGroup => Array.isArray((row as { items?: unknown }).items);

export function flattenItems(items: readonly (ComboboxItemInput | ComboboxGroupInput)[]): ComboboxOption[] {
  return items.flatMap((item) => (isGroupInput(item) ? item.items.map(toOption) : [toOption(item)]));
}

export function toRows(
  items: readonly (ComboboxItemInput | ComboboxGroupInput)[],
  query: string,
  filter: ComboboxFilter | null = defaultFilter,
): ComboboxRow[] {
  return items.flatMap((item): ComboboxRow[] => {
    if (!isGroupInput(item)) return filterOptions([toOption(item)], query, filter);
    const kept = filterOptions(item.items.map(toOption), query, filter);
    return kept.length ? [{ value: item.value, items: kept }] : [];
  });
}

export type ComboboxContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  rows: ComboboxRow[];
  filtered: ComboboxOption[];
  selected: ComboboxOption[];
  inputValue: string;
  query: string;
  typeText: (text: string) => void;
  multiple: boolean;
  disabled?: boolean;
  anchorRef: RefObject<View | null>;
  inputRef: RefObject<TextInput | null>;
  anchorTick: number;
  bumpAnchor: () => void;
  isSelected: (value: string) => boolean;
  isDisabled: (value: string) => boolean;
  labelOf: (value: string) => string;
  select: (value: string) => void;
  remove: (value: string) => void;
  removeLast: () => void;
  clear: () => void;
  submit: () => void;
};

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export function useCombobox() {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error('Combobox parts must be used within a Combobox');
  return ctx;
}

export type ComboboxStateOptions = {
  items: readonly (ComboboxItemInput | ComboboxGroupInput)[];
  multiple?: boolean;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (value: never) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (text: string) => void;
  filter?: ComboboxFilter | null;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type AnyValue = string | string[] | null;

const toValues = (value: AnyValue | undefined) => (Array.isArray(value) ? value : value ? [value] : []);

export function useComboboxState({
  items, multiple = false, value: valueProp, defaultValue, onValueChange, inputValue: inputProp, defaultInputValue, onInputValueChange,
  filter = defaultFilter, disabled, open: openProp, defaultOpen = false, onOpenChange,
}: ComboboxStateOptions): ComboboxContextValue {
  const anchorRef = useRef<View>(null);
  const inputRef = useRef<TextInput>(null);

  const options = useMemo(() => flattenItems(items), [items]);
  // Remembers options that left `items` (server-side filtering), so selected labels survive a refetch.
  const known = useRef(new Map<string, ComboboxOption>());
  const byValue = useMemo(() => {
    for (const o of options) known.current.set(o.value, o);
    return new Map(options.map((o) => [o.value, o]));
  }, [options]);
  const find = useCallback((v: string) => byValue.get(v) ?? known.current.get(v), [byValue]);
  const labelOf = useCallback((v: string) => find(v)?.label ?? v, [find]);
  const textOf = (values: string[]) => (multiple || !values.length ? '' : labelOf(values[0]));

  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [value, setValue] = useControllableState<AnyValue>({
    value: valueProp,
    defaultValue: defaultValue ?? (multiple ? [] : null),
    onChange: onValueChange as ((next: AnyValue) => void) | undefined,
  });
  const values = toValues(value);
  const text = textOf(values);
  const [inputValue, setInputValue] = useControllableState({
    value: inputProp,
    defaultValue: defaultInputValue ?? textOf(toValues(valueProp !== undefined ? valueProp : defaultValue)),
    onChange: onInputValueChange,
  });
  // Only text the user typed filters: opening with a selected label showing in the input lists everything.
  const [edited, setEdited] = useState(false);
  // Bumped when an anchor lays out again (chips wrapping), so the popup re-measures it.
  const [anchorTick, setAnchorTick] = useState(0);
  const bumpAnchor = useCallback(() => setAnchorTick((n) => n + 1), []);
  const query = edited ? inputValue : '';

  const setOpen = useCallback((next: boolean) => {
    if (!(next && disabled)) setOpenState(next);
  }, [disabled, setOpenState]);

  const latestInput = useRef(inputValue);
  latestInput.current = inputValue;
  const wasOpen = useRef(open);
  const lastText = useRef(text);
  useLayoutEffect(() => {
    const closing = !open && wasOpen.current;
    const textChanged = lastText.current !== text;
    wasOpen.current = open;
    lastText.current = text;
    if (closing) {
      setEdited(false);
      Keyboard.dismiss();
    }
    if ((closing || (textChanged && !open)) && latestInput.current !== text) setInputValue(text);
  }, [open, text, setInputValue]);

  const rows = useMemo(() => toRows(items, query, filter), [items, query, filter]);
  const filtered = useMemo(() => rows.flatMap((r) => (isGroup(r) ? r.items : [r])), [rows]);

  return useMemo<ComboboxContextValue>(() => {
    const select = (next: string) => {
      if (disabled || byValue.get(next)?.disabled) return;
      if (multiple) {
        setValue(values.includes(next) ? values.filter((v) => v !== next) : [...values, next]);
        setInputValue('');
        setEdited(false);
        return;
      }
      if (values[0] !== next) setValue(next);
      setOpen(false);
    };
    const remove = (v: string) => {
      if (!disabled) setValue(values.filter((x) => x !== v));
    };
    return {
      open,
      setOpen,
      rows,
      filtered,
      selected: values.map((v) => find(v) ?? { value: v, label: v }),
      inputValue,
      query,
      typeText: (next) => {
        if (disabled) return;
        setEdited(true);
        setInputValue(next);
        if (!multiple && !next && values.length) setValue(null);
        setOpen(true);
      },
      multiple,
      disabled,
      anchorRef,
      inputRef,
      anchorTick,
      bumpAnchor,
      isSelected: (v) => values.includes(v),
      isDisabled: (v) => !!byValue.get(v)?.disabled,
      labelOf,
      select,
      remove,
      removeLast: () => {
        if (values.length) remove(values[values.length - 1]);
      },
      clear: () => {
        if (disabled) return;
        if (values.length) setValue(multiple ? [] : null);
        setInputValue('');
        setEdited(false);
      },
      submit: () => {
        if (!edited) {
          if (!multiple) setOpen(false);
          return;
        }
        const first = filtered.find((o) => !o.disabled);
        if (!first) return;
        select(first.value);
      },
    };
  }, [open, setOpen, value, setValue, rows, filtered, byValue, find, labelOf, inputValue, query, edited, anchorTick, bumpAnchor, setInputValue, multiple, disabled]);
}

const PAD = 8;

const createPopupStyles = (t: Theme) =>
  StyleSheet.create({
    layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'box-none' },
    hit: { position: 'absolute' },
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
  });

export type ComboboxContentProps = ViewProps & Omit<AnchoredOptions, 'side'> & { dismissable?: boolean; ref?: Ref<View> };

export function ComboboxContent({ dismissable = true, ...props }: ComboboxContentProps) {
  const combobox = useCombobox();
  const present = usePresence(combobox.open);
  if (!present) return null;
  // Non-modal: the input it belongs to stays in the app tree, tappable and visible to screen readers.
  return (
    <Portal modal={false}>
      <ComboboxContext.Provider value={combobox}>
        <ComboboxPopup dismissable={dismissable} {...props} />
      </ComboboxContext.Provider>
    </Portal>
  );
}

function ComboboxPopup({ dismissable, style, onLayout, ...rest }: Omit<ComboboxContentProps, 'ref'> & { dismissable: boolean }) {
  const [anchored, props] = splitAnchored(rest, { align: 'start' });
  const s = useStyles(createPopupStyles);
  const { open, setOpen, anchorRef, anchorTick } = useCombobox();
  const dismiss = useCallback(() => {
    if (dismissable) setOpen(false);
  }, [dismissable, setOpen]);
  useBackDismiss(open, dismiss);

  const pos = useAnchoredPosition(open, anchorRef, { ...anchored, fit: true });
  const a = pos.anchor;
  const { measure } = pos;
  useEffect(measure, [measure, anchorTick]);

  const edge = { pointerEvents: open ? 'auto' : 'none' } as const;
  const hole = a && {
    top: { top: 0, left: 0, right: 0, height: a.y },
    bottom: { top: a.y + a.height, left: 0, right: 0, bottom: 0 },
    left: { top: a.y, left: 0, width: a.x, height: a.height },
    right: { top: a.y, left: a.x + a.width, right: 0, height: a.height },
  };

  return (
    <View style={s.layer}>
      {hole && (Object.keys(hole) as (keyof typeof hole)[]).map((key) => (
        <Pressable key={key} testID={`combobox-backdrop-${key}`} accessible={false} onPress={dismiss} style={[s.hit, hole[key], edge]} />
      ))}
      <Animated.View
        {...props}
        onAccessibilityEscape={dismiss}
        onLayout={(e: LayoutChangeEvent) => {
          pos.onLayout(e);
          onLayout?.(e);
        }}
        style={[s.surface, pos.style, edge, { width: a?.width ?? 0, maxHeight: pos.maxHeight }, style]}
      />
    </View>
  );
}

const createFieldStyles = (t: Theme) =>
  StyleSheet.create({
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
      borderRadius: t.radius.md,
      borderWidth: 1,
      borderColor: t.colors.input,
    },
    focused: { borderColor: t.colors.ring },
    invalid: { borderColor: t.colors.destructive },
    disabled: { opacity: 0.5 },
    input: { flex: 1, height: 36, paddingVertical: 0, paddingHorizontal: t.spacing[3], fontSize: t.fontSize.base, color: t.colors.foreground },
    button: { width: 28, height: 28, marginRight: t.spacing[1], borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center' },
    pressed: { backgroundColor: t.colors.accent },
  });

export type ComboboxFieldProps = { disabled?: boolean; 'aria-invalid'?: boolean };

// Shared by the inline input and the chips input: typing, focus and tapping open the list.
function useComboboxInputProps({ disabled, ...props }: TextInputProps & ComboboxFieldProps & { ref?: Ref<TextInput> }) {
  const { colors } = useTheme();
  const combobox = useCombobox();
  const off = disabled || combobox.disabled;
  const { onChangeText, onFocus, onPressIn, onSubmitEditing, ref, ...rest } = props;
  return {
    off,
    props: {
      ref: mergeRefs(ref, combobox.inputRef),
      value: combobox.inputValue,
      editable: !off,
      autoCorrect: false,
      autoCapitalize: 'none',
      // Stays focused on a miss (closing after a pick dismisses the keyboard). Gboard hides itself on "done".
      submitBehavior: 'submit',
      returnKeyType: 'search',
      placeholderTextColor: colors.mutedForeground,
      accessibilityRole: 'combobox',
      accessibilityLabel: props.placeholder,
      accessibilityState: { expanded: combobox.open, disabled: !!off },
      onChangeText: (text: string) => {
        combobox.typeText(text);
        onChangeText?.(text);
      },
      onFocus: (e) => {
        if (!off) combobox.setOpen(true);
        onFocus?.(e);
      },
      // A focused input fires no focus again: this reopens it after Back hid the popup.
      onPressIn: (e) => {
        if (!off) combobox.setOpen(true);
        onPressIn?.(e);
      },
      onSubmitEditing: (e) => {
        combobox.submit();
        onSubmitEditing?.(e);
      },
      ...rest,
    } as TextInputProps & { ref: Ref<TextInput> },
  };
}

export type ComboboxInputProps = TextInputProps &
  ComboboxFieldProps & {
    showTrigger?: boolean;
    showClear?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    ref?: Ref<TextInput>;
  };

export function ComboboxInput({
  showTrigger = true, showClear, containerStyle, style, onBlur, 'aria-invalid': invalid, disabled, ref, ...rest
}: ComboboxInputProps) {
  const s = useStyles(createFieldStyles);
  const combobox = useCombobox();
  const [focused, setFocused] = useState(false);
  const { off, props } = useComboboxInputProps({ ...rest, disabled, ref, onFocus: (e) => { setFocused(true); rest.onFocus?.(e); } });
  const hasContent = combobox.selected.length > 0 || combobox.inputValue !== '';
  return (
    <View
      ref={combobox.anchorRef}
      testID="combobox-anchor"
      onLayout={combobox.bumpAnchor}
      style={[s.field, focused && s.focused, invalid === true && s.invalid, off && s.disabled, containerStyle]}
    >
      <TextInput
        {...props}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[s.input, style]}
      />
      {showClear && hasContent ? <ComboboxClear disabled={off} /> : null}
      {showTrigger ? <ComboboxTrigger disabled={off} /> : null}
    </View>
  );
}

export type ComboboxTriggerProps = Omit<PressableProps, 'children'>;

export function ComboboxTrigger({ disabled, onPress, ...props }: ComboboxTriggerProps) {
  const s = useStyles(createFieldStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  const off = disabled || combobox.disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Show options"
      accessibilityState={{ expanded: combobox.open, disabled: !!off }}
      disabled={off}
      hitSlop={6}
      style={({ pressed }) => [s.button, pressed && s.pressed]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        if (combobox.open) {
          combobox.setOpen(false);
          return;
        }
        combobox.setOpen(true);
        combobox.inputRef.current?.focus();
      }}
    >
      <Icon icon={ChevronDown} color={colors.mutedForeground} />
    </Pressable>
  );
}

export type ComboboxClearProps = Omit<PressableProps, 'children'>;

export function ComboboxClear({ disabled, onPress, ...props }: ComboboxClearProps) {
  const s = useStyles(createFieldStyles);
  const { colors } = useTheme();
  const combobox = useCombobox();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Clear"
      disabled={disabled || combobox.disabled}
      hitSlop={6}
      style={({ pressed }) => [s.button, pressed && s.pressed]}
      {...props}
      onPress={(e) => {
        onPress?.(e);
        combobox.clear();
        combobox.inputRef.current?.focus();
      }}
    >
      <Icon icon={X} color={colors.mutedForeground} />
    </Pressable>
  );
}

const createChipsStyles = (t: Theme) => ({
  base: StyleSheet.create({
    chips: { flexWrap: 'wrap', gap: t.spacing[1], paddingHorizontal: t.spacing[2], paddingVertical: 3 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing[1],
      height: 26,
      paddingLeft: t.spacing[2],
      paddingRight: 2,
      borderRadius: t.radius.sm,
      backgroundColor: t.colors.secondary,
    },
    chipOnly: { paddingRight: t.spacing[2] },
    remove: { width: 20, height: 20, borderRadius: t.radius.sm, alignItems: 'center', justifyContent: 'center' },
    input: { flexGrow: 1, flexBasis: 72, minWidth: 72, height: 26, paddingVertical: 0, paddingHorizontal: t.spacing[1], fontSize: t.fontSize.base },
    value: { flexShrink: 1, fontSize: t.fontSize.sm },
    placeholder: { color: t.colors.mutedForeground },
  }),
  chipText: { fontSize: t.fontSize.xs, fontWeight: t.fontWeight.medium, color: t.colors.secondaryForeground },
});

export type ComboboxChipsProps = Omit<PressableProps, 'style' | 'children'> &
  Pick<ComboboxFieldProps, 'aria-invalid'> & { style?: StyleProp<ViewStyle>; children?: ReactNode; ref?: Ref<View> };

export function ComboboxChips({ style, 'aria-invalid': invalid, children, ref, ...props }: ComboboxChipsProps) {
  const f = useStyles(createFieldStyles);
  const s = useStyles(createChipsStyles).base;
  const combobox = useCombobox();
  const off = combobox.disabled;
  return (
    <Pressable
      ref={mergeRefs(ref, combobox.anchorRef)}
      testID="combobox-anchor"
      onLayout={combobox.bumpAnchor}
      accessible={false}
      disabled={off}
      onPress={() => combobox.inputRef.current?.focus()}
      style={[f.field, s.chips, combobox.open && f.focused, invalid === true && f.invalid, off && f.disabled, style]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export type ComboboxChipProps = ViewProps & { value: string; showRemove?: boolean; children?: ReactNode };

export function ComboboxChip({ value, showRemove = true, style, children, ...props }: ComboboxChipProps) {
  const styles = useStyles(createChipsStyles);
  const s = styles.base;
  const { colors } = useTheme();
  const combobox = useCombobox();
  const removable = showRemove && !combobox.disabled;
  return (
    <TextStyleContext.Provider value={styles.chipText}>
      <View style={[s.chip, !removable && s.chipOnly, style]} {...props}>
        {typeof children === 'string' || typeof children === 'number' || children === undefined ? <Text>{children ?? combobox.labelOf(value)}</Text> : children}
        {removable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${combobox.labelOf(value)}`}
            hitSlop={6}
            style={s.remove}
            onPress={() => combobox.remove(value)}
          >
            <Icon icon={X} size={12} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>
    </TextStyleContext.Provider>
  );
}

export type ComboboxChipsInputProps = TextInputProps & { ref?: Ref<TextInput> };

export function ComboboxChipsInput({ style, onKeyPress, ...rest }: ComboboxChipsInputProps) {
  const s = useStyles(createChipsStyles).base;
  const f = useStyles(createFieldStyles);
  const combobox = useCombobox();
  const { props } = useComboboxInputProps(rest);
  return (
    <TextInput
      {...props}
      onKeyPress={(e) => {
        if (e.nativeEvent.key === 'Backspace' && combobox.inputValue === '') combobox.removeLast();
        onKeyPress?.(e);
      }}
      style={[f.input, s.input, style]}
    />
  );
}

export type ComboboxValueProps = Omit<TextProps, 'children'> & {
  placeholder?: string;
  children?: (selected: ComboboxOption[]) => ReactNode;
};

export function ComboboxValue({ placeholder, style, children, ...props }: ComboboxValueProps) {
  const s = useStyles(createChipsStyles).base;
  const { selected } = useCombobox();
  if (children) return <>{children(selected)}</>;
  const empty = selected.length === 0;
  return (
    <Text numberOfLines={1} style={[s.value, empty && s.placeholder, style]} {...props}>
      {empty ? placeholder : selected.map((o) => o.label).join(', ')}
    </Text>
  );
}

const createListStyles = (t: Theme) =>
  StyleSheet.create({
    list: { flexGrow: 0, flexShrink: 1, maxHeight: 300 },
    listContent: { padding: t.spacing[1] },
    empty: { paddingVertical: t.spacing[6], textAlign: 'center', fontSize: t.fontSize.sm },
    label: { paddingHorizontal: t.spacing[2], paddingVertical: t.spacing[1], fontSize: t.fontSize.xs, color: t.colors.mutedForeground },
  });

const ScrollContext = createContext<((node: View) => void) | null>(null);
const GroupContext = createContext<ComboboxOption[]>([]);

export type ComboboxListProps<T = ComboboxOption> = Omit<ScrollViewProps, 'children'> & {
  children?: (row: T, index: number) => ReactNode;
  ref?: Ref<ScrollView>;
};

export function ComboboxList<T = ComboboxOption>({ children, style, contentContainerStyle, ref, ...props }: ComboboxListProps<T>) {
  const s = useStyles(createListStyles);
  const { rows, filtered } = useCombobox();
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
          {rows.map((row, index) => (
            <Fragment key={isGroup(row) ? `group:${row.value}` : row.value}>
              {children ? children(row as T, index) : isGroup(row) ? <DefaultGroup group={row} first={index === 0} /> : <ComboboxItem value={row.value} />}
            </Fragment>
          ))}
        </ScrollContext.Provider>
      </View>
    </ScrollView>
  );
}

function DefaultGroup({ group, first }: { group: ComboboxOptionGroup; first: boolean }) {
  return (
    <>
      {first ? null : <ComboboxSeparator />}
      <ComboboxGroup items={group.items}>
        <ComboboxLabel>{group.value}</ComboboxLabel>
        <ComboboxCollection />
      </ComboboxGroup>
    </>
  );
}

export type ComboboxGroupProps = ViewProps & { items: readonly ComboboxOption[] };

export function ComboboxGroup({ items, ...props }: ComboboxGroupProps) {
  return (
    <GroupContext.Provider value={items as ComboboxOption[]}>
      <View {...props} />
    </GroupContext.Provider>
  );
}

export function ComboboxLabel({ style, ...props }: TextProps) {
  const s = useStyles(createListStyles);
  return <Text style={[s.label, style]} {...props} />;
}

export type ComboboxCollectionProps<T = ComboboxOption> = { children?: (item: T, index: number) => ReactNode };

export function ComboboxCollection<T = ComboboxOption>({ children }: ComboboxCollectionProps<T>) {
  const items = useContext(GroupContext);
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.value}>{children ? children(item as T, index) : <ComboboxItem value={item.value} />}</Fragment>
      ))}
    </>
  );
}

export const ComboboxSeparator = MenuSeparator;

export type ComboboxItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant'> & { value: string };

export function ComboboxItem({ value, disabled, children, ref, onLayout, accessibilityState, ...props }: ComboboxItemProps) {
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
      disabled={disabled ?? combobox.isDisabled(value)}
      {...props}
    >
      {children ?? combobox.labelOf(value)}
    </MenuItemRow>
  );
}

export function ComboboxEmpty({ style, ...props }: TextProps) {
  const s = useStyles(createListStyles);
  const { filtered } = useCombobox();
  if (filtered.length > 0) return null;
  return <Text accessibilityLiveRegion="polite" style={[s.empty, style]} {...props} />;
}

export type ComboboxProps = Omit<ComboboxStateOptions, 'multiple' | 'value' | 'defaultValue' | 'onValueChange'> & {
  children?: ReactNode;
} & (
    | { multiple?: false; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void }
    | { multiple: true; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
  );

export function Combobox({ children, ...options }: ComboboxProps) {
  const ctx = useComboboxState(options);
  return <ComboboxContext.Provider value={ctx}>{children}</ComboboxContext.Provider>;
}
