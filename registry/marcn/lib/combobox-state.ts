import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { Keyboard } from 'react-native';
import {
  defaultFilter, filterOptions, toOption, type ComboboxFilter, type ComboboxItemInput, type ComboboxOption,
} from '@/registry/marcn/lib/combobox-filter';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';

export type ComboboxContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  filtered: ComboboxOption[];
  selected: ComboboxOption[];
  query: string;
  setQuery: (query: string) => void;
  multiple: boolean;
  disabled?: boolean;
  isSelected: (value: string) => boolean;
  labelOf: (value: string) => string;
  select: (value: string) => void;
  submit: () => void;
};

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);

export function useCombobox() {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error('Combobox parts must be used within a Combobox');
  return ctx;
}

export type ComboboxStateOptions = {
  items: readonly ComboboxItemInput[];
  multiple?: boolean;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onValueChange?: (value: never) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (query: string) => void;
  filter?: ComboboxFilter | null;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type AnyValue = string | string[] | null;

export function useComboboxState({
  items, multiple = false, value: valueProp, defaultValue, onValueChange, inputValue, defaultInputValue = '', onInputValueChange,
  filter = defaultFilter, disabled, open: openProp, defaultOpen = false, onOpenChange,
}: ComboboxStateOptions): ComboboxContextValue {
  const [open, setOpenState] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange });
  const [value, setValue] = useControllableState<AnyValue>({
    value: valueProp,
    defaultValue: defaultValue ?? (multiple ? [] : null),
    onChange: onValueChange as ((next: AnyValue) => void) | undefined,
  });
  const [query, setQuery] = useControllableState({ value: inputValue, defaultValue: defaultInputValue, onChange: onInputValueChange });

  const setOpen = useCallback((next: boolean) => {
    if (!(next && disabled)) setOpenState(next);
  }, [disabled, setOpenState]);

  // Cleared on open rather than close, so the list does not jump back to everything while it fades out.
  const wasOpen = useRef(open);
  useLayoutEffect(() => {
    if (open && !wasOpen.current) setQuery('');
    if (!open && wasOpen.current) Keyboard.dismiss();
    wasOpen.current = open;
  }, [open, setQuery]);

  const options = useMemo(() => items.map(toOption), [items]);
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);
  const filtered = useMemo(() => filterOptions(options, query, filter), [options, query, filter]);

  return useMemo<ComboboxContextValue>(() => {
    const values = Array.isArray(value) ? value : value ? [value] : [];
    const select = (next: string) => {
      if (disabled) return;
      if (multiple) {
        setValue(values.includes(next) ? values.filter((v) => v !== next) : [...values, next]);
        return;
      }
      setValue(values[0] === next ? null : next);
      setOpen(false);
    };
    return {
      open,
      setOpen,
      filtered,
      selected: values.map((v) => byValue.get(v) ?? { value: v, label: v }),
      query,
      setQuery,
      multiple,
      disabled,
      isSelected: (v) => values.includes(v),
      labelOf: (v) => byValue.get(v)?.label ?? v,
      select,
      submit: () => {
        const first = filtered.find((o) => !o.disabled);
        if (!first) return;
        if (!multiple && values[0] === first.value) setOpen(false);
        else select(first.value);
      },
    };
  }, [open, setOpen, value, setValue, filtered, byValue, query, setQuery, multiple, disabled]);
}
