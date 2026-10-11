import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { commandScore } from '@/registry/marcn/lib/search-filter';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import type { CommandContextValue, CommandEntry, CommandFilter } from '@/registry/marcn/ui/command/context';
import { rankChildren } from '@/registry/marcn/ui/command/rank-children';

export type CommandStateOptions = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  filter?: CommandFilter;
  shouldFilter?: boolean;
};

const defaultFilter: CommandFilter = (value, search, keywords) => commandScore(value, search, keywords);

export function useCommandState({
  value, defaultValue = '', onValueChange, filter = defaultFilter, shouldFilter = true,
}: CommandStateOptions): CommandContextValue {
  const [search, setSearch] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const active = shouldFilter ? filter : null;
  const searching = !!active && search.trim() !== '';

  // Items register in layout effects; the counter re-derives visibility without storing entries in state.
  const registry = useRef(new Map<string, CommandEntry>());
  const [version, setVersion] = useState(0);
  const register = useCallback((id: string, entry: CommandEntry) => {
    registry.current.set(id, entry);
    setVersion((n) => n + 1);
    return () => {
      registry.current.delete(id);
      setVersion((n) => n + 1);
    };
  }, []);

  const scoreOf = useCallback(
    (itemValue: string, keywords?: readonly string[]) => (searching && active ? active(itemValue, search, keywords) : 1),
    [searching, active, search],
  );

  const derived = useMemo(() => {
    let visibleCount = 0;
    const groups = new Set<string>();
    let best = null as { id: string; score: number } | null;
    for (const [id, entry] of registry.current) {
      const score = scoreOf(entry.value, entry.keywords);
      if (score <= 0) continue;
      visibleCount += 1;
      if (entry.groupId) groups.add(entry.groupId);
      if (searching && !entry.disabled && (!best || score > best.score)) best = { id, score };
    }
    return { visibleCount, groups, bestId: best ? best.id : null };
    // `version` is the registry's change signal; the map itself is a ref.
  }, [version, scoreOf, searching]);

  const rank = useCallback((children: ReactNode) => rankChildren(children, search, active), [search, active]);

  return useMemo<CommandContextValue>(
    () => ({
      search,
      setSearch,
      searching,
      scoreOf,
      register,
      visibleCount: derived.visibleCount,
      isGroupVisible: (groupId) => !searching || derived.groups.has(groupId),
      bestId: derived.bestId,
      submit: () => {
        if (derived.bestId) registry.current.get(derived.bestId)?.run();
      },
      rank,
    }),
    [search, setSearch, searching, scoreOf, register, derived, rank],
  );
}
