import { useCallback, useRef, useState } from 'react';

type Options<T> = { value?: T; defaultValue: T; onChange?: (value: T) => void };

export function useControllableState<T>({ value, defaultValue, onChange }: Options<T>): [T, (next: T) => void] {
  const [inner, setInner] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;

  const latest = useRef({ current, onChange });
  latest.current = { current, onChange };

  const setValue = useCallback(
    (next: T) => {
      if (Object.is(next, latest.current.current)) return;
      if (!controlled) setInner(next);
      latest.current.onChange?.(next);
    },
    [controlled],
  );

  return [current, setValue];
}
