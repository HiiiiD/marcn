import { useSyncExternalStore, type ReactNode } from 'react';
import { Portal } from '@/registry/marcn/ui/portal';
import { ToastLayer } from '@/registry/marcn/ui/sonner/layer';
import type { ToastPosition } from '@/registry/marcn/ui/sonner/stack';
import {
  dismissToast, getToasts, nextToastId, subscribe, upsertToast,
  type ToastId, type ToastOptions, type ToastType,
} from '@/registry/marcn/ui/sonner/store';

export type { ToastId, ToastOptions, ToastPosition };

const DEFAULT_DURATION = 4000;

const creator = (type: ToastType) => (message: ReactNode, options?: ToastOptions) =>
  upsertToast({ ...options, type, title: message });

type Resolvable<T> = ReactNode | ((value: T) => ReactNode);
const resolve = <T,>(message: Resolvable<T>, value: T) =>
  typeof message === 'function' ? (message as (v: T) => ReactNode)(value) : message;

type PromiseMessages<T> = { loading: ReactNode; success: Resolvable<T>; error: Resolvable<unknown> };

function promise<T>(source: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options?: ToastOptions) {
  const id = options?.id ?? nextToastId();
  upsertToast({ ...options, id, type: 'loading', title: messages.loading });

  // A throwing message function must still end the loading state, or the spinner never resolves.
  const settle = <V,>(type: 'success' | 'error', message: Resolvable<V>, value: V) => {
    let title: ReactNode;
    try {
      title = resolve(message, value);
    } catch (e) {
      type = 'error';
      title = e instanceof Error ? e.message : String(e);
    }
    upsertToast({ ...options, id, type, title });
  };

  let run: Promise<T>;
  try {
    run = typeof source === 'function' ? source() : source;
  } catch (e) {
    run = Promise.reject(e);
  }
  run.then(
    (value) => settle('success', messages.success, value),
    (reason: unknown) => settle('error', messages.error, reason),
  );
  return id;
}

export const toast = Object.assign(creator('default'), {
  success: creator('success'),
  error: creator('error'),
  info: creator('info'),
  warning: creator('warning'),
  loading: creator('loading'),
  custom: (render: (id: ToastId) => ReactNode, options?: ToastOptions) => upsertToast({ ...options, type: 'default', custom: render }),
  promise,
  dismiss: (id?: ToastId) => dismissToast(id),
});

export type ToasterProps = { position?: ToastPosition; visibleToasts?: number; duration?: number };

export function Toaster({ position = 'bottom', visibleToasts = 3, duration = DEFAULT_DURATION }: ToasterProps) {
  const toasts = useSyncExternalStore(subscribe, getToasts, getToasts);
  if (!toasts.length) return null;
  return (
    <Portal modal={false}>
      <ToastLayer toasts={toasts} position={position} visibleToasts={visibleToasts} duration={duration} />
    </Portal>
  );
}
