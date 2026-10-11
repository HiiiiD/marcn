import { createContext, useContext } from 'react';

export type SelectContextValue = {
  value?: string;
  setValue: (value: string) => void;
  labels: Record<string, string>;
  registerLabels: (labels: Record<string, string>) => void;
  disabled?: boolean;
};

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelect() {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error('Select parts must be used within a Select');
  return ctx;
}
