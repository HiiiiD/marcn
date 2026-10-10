import { useEffect, useRef } from 'react';

type Options = { duration: number; paused: boolean; rev: number; onExpire: () => void };

export function useToastTimer({ duration, paused, rev, onExpire }: Options) {
  const remaining = useRef(duration);
  const seen = useRef({ rev, duration });
  const expire = useRef(onExpire);
  expire.current = onExpire;

  useEffect(() => {
    if (seen.current.rev !== rev || seen.current.duration !== duration) {
      seen.current = { rev, duration };
      remaining.current = duration;
    }
    if (paused || !Number.isFinite(duration)) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => expire.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt));
    };
  }, [paused, rev, duration]);
}
