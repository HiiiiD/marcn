import { createContext, useContext } from 'react';
import type { View } from 'react-native';
import type { ComboboxContextValue, ComboboxOption } from '@/registry/marcn/ui/combobox/types';

export const ComboboxContext = createContext<ComboboxContextValue | null>(null);
// Where a ComboboxInput sits decides its role: in the popup it is a search box, elsewhere it is the anchor.
export const PopupContext = createContext(false);
export const FieldContext = createContext(false);
export const ScrollContext = createContext<((node: View) => void) | null>(null);
export const GroupContext = createContext<ComboboxOption[]>([]);

export function useCombobox() {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error('Combobox parts must be used within a Combobox');
  return ctx;
}
