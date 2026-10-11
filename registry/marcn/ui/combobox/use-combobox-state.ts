import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, type TextInput, type View } from 'react-native';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { defaultFilter, flattenItems, isGroup, toRows } from '@/registry/marcn/ui/combobox/filter';
import type { ComboboxContextValue, ComboboxOption, ComboboxStateOptions } from '@/registry/marcn/ui/combobox/types';

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
  // A trigger-button combobox keeps its search box empty: the choice shows on the trigger, not in the input.
  const [searchInPopup, setSearchInPopup] = useState(false);
  const text = searchInPopup ? '' : textOf(values);
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
        if (!multiple && !next && values.length && !searchInPopup) setValue(null);
        setOpen(true);
      },
      multiple,
      disabled,
      anchorRef,
      inputRef,
      anchorTick,
      setSearchInPopup,
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
  }, [open, setOpen, value, setValue, rows, filtered, byValue, find, labelOf, inputValue, query, edited, anchorTick, bumpAnchor, setInputValue, searchInPopup, multiple, disabled]);
}
