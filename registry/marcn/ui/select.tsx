import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { MenuItemRow, MenuLabel, MenuSeparator, useMenuClose, type MenuItemRowProps } from '@/registry/marcn/lib/menu-item';
import { MenuSurface, type MenuSurfaceProps } from '@/registry/marcn/lib/menu-surface';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import {
  OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps, type OverlayTriggerProps,
} from '@/registry/marcn/lib/overlay-root';
import { useStyles, useTheme, type Theme } from '@/registry/marcn/lib/theme';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { usePresence } from '@/registry/marcn/lib/use-presence';
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
    hidden: { display: 'none' },
  });

type SelectContextValue = {
  value?: string;
  setValue: (value: string) => void;
  labels: Record<string, string>;
  registerLabel: (value: string, label: string) => void;
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
  const registerLabel = useCallback(
    (v: string, label: string) => setLabels((prev) => (prev[v] === label ? prev : { ...prev, [v]: label })),
    [],
  );
  const ctx = useMemo(
    () => ({ value, setValue: (next: string) => setValue(next), labels, registerLabel, disabled }),
    [value, setValue, labels, registerLabel, disabled],
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
  const isDisabled = disabled ?? select.disabled;
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
  const text = value === undefined ? placeholder : (labels[value] ?? value);
  return (
    <Text numberOfLines={1} style={[s.value, value === undefined && s.placeholder, style]} {...props}>
      {text}
    </Text>
  );
}

export type SelectContentProps = MenuSurfaceProps & {
  dismissable?: boolean;
  initialFocusRef?: OverlayProps['initialFocusRef'];
};

export function SelectContent({ dismissable, initialFocusRef, children, ...props }: SelectContentProps) {
  const s = useStyles(createStyles);
  const select = useSelect();
  const { open } = useOverlay();
  const present = usePresence(open);
  return (
    <>
      {/* Closed items are not mounted in the portal, so a hidden copy keeps their labels registered for SelectValue. */}
      {!present && <View style={s.hidden}>{children}</View>}
      <Overlay modal scrim={false} dismissable={dismissable} initialFocusRef={initialFocusRef}>
        <SelectContext.Provider value={select}>
          <MenuSurface matchTriggerWidth {...props}>
            {children}
          </MenuSurface>
        </SelectContext.Provider>
      </Overlay>
    </>
  );
}

export type SelectItemProps = Omit<MenuItemRowProps, 'onPress' | 'indicator' | 'indicatorSide' | 'variant'> & {
  value: string;
  label?: string;
};

export function SelectItem({ value, label, children, ...props }: SelectItemProps) {
  const select = useSelect();
  const close = useMenuClose();
  const text = label ?? (typeof children === 'string' ? children : value);
  const { registerLabel } = select;
  useEffect(() => {
    registerLabel(value, text);
  }, [registerLabel, value, text]);
  const selected = select.value === value;
  return (
    <MenuItemRow
      role="option"
      accessibilityState={{ selected }}
      indicator={selected ? <Icon icon={Check} /> : null}
      indicatorSide="end"
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
