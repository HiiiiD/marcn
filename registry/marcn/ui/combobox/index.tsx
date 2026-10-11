import type { ReactNode } from 'react';
import { ComboboxContext } from '@/registry/marcn/ui/combobox/context';
import { useComboboxState } from '@/registry/marcn/ui/combobox/use-combobox-state';
import type { ComboboxStateOptions } from '@/registry/marcn/ui/combobox/types';

export * from '@/registry/marcn/ui/combobox/types';
export * from '@/registry/marcn/ui/combobox/filter';
export { ComboboxContext, useCombobox } from '@/registry/marcn/ui/combobox/context';
export * from '@/registry/marcn/ui/combobox/use-combobox-state';
export * from '@/registry/marcn/ui/combobox/content';
export * from '@/registry/marcn/ui/combobox/input';
export * from '@/registry/marcn/ui/combobox/trigger';
export * from '@/registry/marcn/ui/combobox/clear';
export * from '@/registry/marcn/ui/combobox/chips';
export * from '@/registry/marcn/ui/combobox/list';
export * from '@/registry/marcn/ui/combobox/parts';
export * from '@/registry/marcn/ui/combobox/combobox-item';
export type { ComboboxFieldProps } from '@/registry/marcn/ui/combobox/input-props';

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
