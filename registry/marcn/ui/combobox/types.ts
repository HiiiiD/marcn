import type { RefObject } from 'react';
import type { TextInput, View } from 'react-native';

export type ComboboxOption = { value: string; label: string; disabled?: boolean; keywords?: readonly string[] };
export type ComboboxItemInput = string | (Omit<ComboboxOption, 'label'> & { label?: string } & Record<string, unknown>);
export type ComboboxGroupInput = { value: string; items: readonly ComboboxItemInput[] };
export type ComboboxOptionGroup = { value: string; items: ComboboxOption[] };
export type ComboboxRow = ComboboxOption | ComboboxOptionGroup;
export type ComboboxFilter = (option: ComboboxOption, query: string) => boolean;

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
  setSearchInPopup: (on: boolean) => void;
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
