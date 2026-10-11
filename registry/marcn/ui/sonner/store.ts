import type { ReactNode } from 'react';

export type ToastId = string | number;
export type ToastType = 'default' | 'success' | 'error' | 'info' | 'warning' | 'loading';

export type ToastOptions = {
  id?: ToastId;
  description?: ReactNode;
  duration?: number;
  dismissible?: boolean;
  action?: { label: string; onPress: () => void };
  cancel?: { label: string; onPress?: () => void };
  onDismiss?: (id: ToastId) => void;
  onAutoClose?: (id: ToastId) => void;
};

export type ToastInput = ToastOptions & {
  type: ToastType;
  title?: ReactNode;
  custom?: (id: ToastId) => ReactNode;
};

export type ToastData = Omit<ToastInput, 'id'> & { id: ToastId; dismissed: boolean; rev: number };

let toasts: readonly ToastData[] = [];
let counter = 0;
let rev = 0;
const listeners = new Set<() => void>();

function commit(next: readonly ToastData[]) {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export const getToasts = () => toasts;

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const nextToastId = () => ++counter;

export function upsertToast(input: ToastInput): ToastId {
  const id = input.id ?? nextToastId();
  const defined = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
  const index = toasts.findIndex((t) => t.id === id);
  // `custom` is set explicitly so updating a custom toast with plain content does not keep the old renderer.
  const next = { ...(index === -1 ? null : toasts[index]), ...defined, id, custom: input.custom, dismissed: false, rev: ++rev } as ToastData;
  commit(index === -1 ? [...toasts, next] : toasts.map((t, i) => (i === index ? next : t)));
  return id;
}

export function dismissToast(id?: ToastId, reason: 'user' | 'auto' = 'user') {
  const targets = toasts.filter((t) => !t.dismissed && (id === undefined || t.id === id));
  if (!targets.length) return;
  commit(toasts.map((t) => (targets.includes(t) ? { ...t, dismissed: true } : t)));
  targets.forEach((t) => (reason === 'auto' ? t.onAutoClose : t.onDismiss)?.(t.id));
}

export function removeToast(id: ToastId) {
  if (toasts.some((t) => t.id === id)) commit(toasts.filter((t) => t.id !== id));
}

export function clearToasts() {
  commit([]);
}
