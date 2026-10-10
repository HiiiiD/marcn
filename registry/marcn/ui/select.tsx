import {
  Children, createContext, isValidElement, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { MenuItemRow, MenuLabel, MenuSeparator, useMenuClose, type MenuItemRowProps } from '@/registry/marcn/lib/menu-item';
import { MenuSurface, useScrollIntoView, type MenuSurfaceProps } from '@/registry/marcn/lib/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import {
  OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps, type OverlayTriggerProps,
} from '@/registry/marcn/lib/overlay-root';
import { mergeRefs } from '@/registry/marcn/lib/render';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { Icon } from '@/registry/marcn/ui/icon';
import { Text, type TextProps } from '@/registry/marcn/ui/text';

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
  });

type SelectContextValue = {
  value?: string;
  setValue: (value: string) => void;
  labels: Record<string, string>;
  registerLabels: (labels: Record<string, string>) => void;
  disabled?: boolean;
};

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelect() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select parts must be used within a Select');
  return ctx;
}

export type SelectProps = OverlayRootProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

export function Select({ value: valueProp, defaultValue, onValueChange, disabled, children, ...root }: SelectProps) {
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const [labels, setLabels] = useState<Record<string, string>>({});
  const registerLabels = useCallback(
    (next: Record<string, string>) =>
      setLabels((prev) => (Object.keys(next).every((key) => prev[key] === next[key]) ? prev : { ...prev, ...next })),
    [],
  );
  const ctx = useMemo(
    () => ({
      value,
      setValue: (next: string) => {
        if (!disabled) setValue(next);
      },
      labels,
      registerLabels,
      disabled,
    }),
    [value, setValue, labels, registerLabels, disabled],
  );
  return (
    <OverlayRoot {...root}>
      <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
    </OverlayRoot>
  );
}

export type SelectTriggerProps = Omit<OverlayTriggerProps, 'style' | 'children'> & {
  size?: 'default' | 'sm';
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SelectTrigger({ size = 'default', style, disabled, children, ...props }: SelectTriggerProps) {
  const s = useStyles(createStyles);
  const { colors } = useTheme();
  const select = useSelect();
  const { open } = useOverlay();
  const isDisabled = disabled || select.disabled;
  return (
    <OverlayTrigger
      accessibilityRole="combobox"
      accessibilityState={{ expanded: open, disabled: !!isDisabled }}
      disabled={isDisabled}
      style={[s.trigger, s[size], isDisabled && s.disabled, style]}
      {...props}
    >
      {children}
      <Icon icon={ChevronDown} color={colors.mutedForeground} />
    </OverlayTrigger>
  );
}

export function SelectValue({ placeholder, style, ...props }: TextProps & { placeholder?: string }) {
  const s = useStyles(createStyles);
  const { value, labels } = useSelect();
  const empty = value === undefined || value === '';
  const text = empty ? placeholder : (labels[value] ?? value);
  return (
    <Text numberOfLines={1} style={[s.value, empty && s.placeholder, style]} {...props}>
      {text}
    </Text>
  );
}

export type SelectContentProps = MenuSurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

// Closed items are not mounted, so SelectValue learns their labels by reading the SelectItem elements.
// Items wrapped in your own components are only discovered once the list has been opened.
function collectLabels(children: ReactNode, into: Record<string, string> = {}) {
  Children.forEach(children, (child) => {
    if (!isValidElement<SelectItemProps & { children?: ReactNode }>(child)) return;
    if (child.type === SelectItem) into[child.props.value] = itemLabel(child.props);
    else collectLabels(child.props.children, into);
  });
  return into;
}

export function SelectContent({ dismissable, initialFocusRef, children, ...props }: SelectContentProps) {
  const select = useSelect();
  const { registerLabels } = select;
  useLayoutEffect(() => registerLabels(collectLabels(children)), [registerLabels, children]);
  return (
    <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef}>
      <SelectContext.Provider value={select}>
        <MenuSurface matchTriggerWidth {...props}>
          {children}
        </MenuSurface>
      </SelectContext.Provider>
    </Overlay>
  );
}

export type SelectItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant' | 'children'> & {
  children?: ReactNode;
  value: string;
  label?: string;
};

const itemLabel = ({ value, label, children }: { value: string; label?: string; children?: ReactNode }) =>
  label ?? (typeof children === 'string' ? children : value);

export function SelectItem({ value, label, children, ref, onLayout, accessibilityState, ...props }: SelectItemProps) {
  const select = useSelect();
  const close = useMenuClose();
  const scrollIntoView = useScrollIntoView();
  const rowRef = useRef<View>(null);
  const text = itemLabel({ value, label, children });
  const { registerLabels } = select;
  useLayoutEffect(() => {
    registerLabels({ [value]: text });
  }, [registerLabels, value, text]);
  const selected = value !== '' && select.value === value;
  // Once per mount: a long list opens on the chosen option instead of the top.
  const scrolled = useRef(false);
  return (
    <MenuItemRow
      ref={mergeRefs(ref, rowRef)}
      role="option"
      accessibilityState={{ ...accessibilityState, selected }}
      indicator={selected ? <Icon icon={Check} /> : null}
      indicatorSide="end"
      onLayout={(e) => {
        onLayout?.(e);
        if (selected && !scrolled.current && rowRef.current && scrollIntoView) {
          scrolled.current = true;
          scrollIntoView(rowRef.current);
        }
      }}
      onPress={() => {
        select.setValue(value);
        close();
      }}
      {...props}
    >
      {children}
    </MenuItemRow>
  );
}

export function SelectGroup(props: ViewProps) {
  return <View {...props} />;
}

export const SelectLabel = MenuLabel;
export const SelectSeparator = MenuSeparator;
