import { createContext } from 'react';
import type { ToggleSize, ToggleVariant } from '@/registry/marcn/ui/toggle';

export type GroupContextValue = {
  isOn: (value: string) => boolean;
  toggle: (value: string) => void;
  variant: ToggleVariant;
  size: ToggleSize;
  disabled: boolean;
  joined: boolean;
};
export const GroupContext = createContext<GroupContextValue | null>(null);
