import { createContext, useContext, type ReactNode } from 'react';

export type CommandFilter = (value: string, search: string, keywords?: readonly string[]) => number;

export type CommandEntry = {
  value: string;
  keywords?: readonly string[];
  disabled?: boolean;
  groupId?: string;
  run: () => void;
};

export type CommandContextValue = {
  search: string;
  setSearch: (search: string) => void;
  searching: boolean;
  scoreOf: (value: string, keywords?: readonly string[]) => number;
  register: (id: string, entry: CommandEntry) => () => void;
  visibleCount: number;
  isGroupVisible: (groupId: string) => boolean;
  bestId: string | null;
  submit: () => void;
  rank: (children: ReactNode) => ReactNode;
};

export const CommandContext = createContext<CommandContextValue | null>(null);
export const GroupIdContext = createContext<string | undefined>(undefined);
export const AutoFocusContext = createContext(false);

export function useCommand() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('Command parts must be used within a Command');
  return ctx;
}
