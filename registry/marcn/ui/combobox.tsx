import type { ReactNode } from 'react';
import { ComboboxContext, useComboboxState, type ComboboxStateOptions } from '@/registry/marcn/lib/combobox-state';

export type {
  ComboboxFilter, ComboboxOptionGroup, ComboboxGroupInput, ComboboxItemInput, ComboboxOption,
} from '@/registry/marcn/lib/combobox-filter';
export { ComboboxContent, type ComboboxContentProps } from '@/registry/marcn/lib/combobox-popup';
export {
  ComboboxClear, ComboboxInput, ComboboxTrigger, type ComboboxClearProps, type ComboboxInputProps, type ComboboxTriggerProps,
} from '@/registry/marcn/lib/combobox-input';
export {
  ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxValue,
  type ComboboxChipProps, type ComboboxChipsInputProps, type ComboboxChipsProps, type ComboboxValueProps,
} from '@/registry/marcn/lib/combobox-chips';
export {
  ComboboxCollection, ComboboxEmpty, ComboboxGroup, ComboboxItem, ComboboxLabel, ComboboxList, ComboboxSeparator,
  type ComboboxCollectionProps, type ComboboxGroupProps, type ComboboxItemProps, type ComboboxListProps,
} from '@/registry/marcn/lib/combobox-list';

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
