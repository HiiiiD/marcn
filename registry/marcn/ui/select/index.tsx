import { useCallback, useMemo, useState } from 'react';
import { OverlayRoot, type OverlayRootProps } from '@/registry/marcn/ui/overlay/overlay-root';
import { useControllableState } from '@/registry/marcn/lib/use-controllable-state';
import { SelectContext } from '@/registry/marcn/ui/select/context';

export * from '@/registry/marcn/ui/select/trigger';
export * from '@/registry/marcn/ui/select/content';
export * from '@/registry/marcn/ui/select/select-item';
export * from '@/registry/marcn/ui/select/parts';

export type SelectProps = OverlayRootProps & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
};

export function Select({ value: valueProp, defaultValue, onValueChange, disabled, children, ...root }: SelectProps) {
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const [labels, setLabels] = useState<Record<string, string>>({});
  const registerLabels = useCallback(
    (next: Record<string, string>) =>
      setLabels((prev) => (Object.keys(next).every((key) => prev[key] === next[key]) ? prev : { ...prev, ...next })),
    [],
  );
  const ctx = useMemo(
    () => ({
      value,
      setValue: (next: string) => {
        if (!disabled) setValue(next);
      },
      labels,
      registerLabels,
      disabled,
    }),
    [value, setValue, labels, registerLabels, disabled],
  );
  return (
    <OverlayRoot {...root}>
      <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
    </OverlayRoot>
  );
}
