import { createContext, useContext, type RefObject } from 'react';
import type { TextInput } from 'react-native';

export type GroupContext = {
  disabled: boolean;
  controlRef: RefObject<TextInput | null>;
  setFocused: (value: boolean) => void;
  setInvalid: (value: boolean) => void;
};


export const GroupContext = createContext<GroupContext | null>(null);

export function useGroup(part: string) {
  const group = useContext(GroupContext);
  if (!group) throw new Error(`${part} must be used within <InputGroup>`);
  return group;
}
