import {
  clearToasts, dismissToast, getToasts, removeToast, subscribe, upsertToast,
} from '@/registry/marcn/lib/toast-store';

beforeEach(clearToasts);

test('adds newest last and generates ids', () => {
  const a = upsertToast({ type: 'default', title: 'a' });
  const b = upsertToast({ type: 'success', title: 'b' });
  expect(a).not.toBe(b);
  expect(getToasts().map((t) => t.title)).toEqual(['a', 'b']);
});

test('same id updates in place, keeps order, bumps rev and undeletes', () => {
  const id = upsertToast({ type: 'loading', title: 'wait', description: 'd' });
  upsertToast({ type: 'default', title: 'other' });
  const first = getToasts()[0];
  dismissToast(id);
  upsertToast({ id, type: 'success', title: 'done' });
  const [updated] = getToasts();
  expect(getToasts().map((t) => t.title)).toEqual(['done', 'other']);
  expect(updated.description).toBe('d');
  expect(updated.dismissed).toBe(false);
  expect(updated.rev).toBeGreaterThan(first.rev);
});

test('an update without custom drops a previous custom renderer', () => {
  const id = upsertToast({ type: 'default', custom: () => null });
  upsertToast({ id, type: 'default', title: 'plain' });
  expect(getToasts()[0].custom).toBeUndefined();
});

test('dismiss marks dismissed and fires onDismiss once', () => {
  const onDismiss = jest.fn();
  const id = upsertToast({ type: 'default', onDismiss });
  dismissToast(id);
  dismissToast(id);
  expect(getToasts()[0].dismissed).toBe(true);
  expect(onDismiss).toHaveBeenCalledTimes(1);
  expect(onDismiss).toHaveBeenCalledWith(id);
});

test('auto reason fires onAutoClose only, and not after a manual dismiss', () => {
  const onDismiss = jest.fn();
  const onAutoClose = jest.fn();
  const a = upsertToast({ type: 'default', onDismiss, onAutoClose });
  dismissToast(a, 'auto');
  expect(onAutoClose).toHaveBeenCalledTimes(1);
  expect(onDismiss).not.toHaveBeenCalled();
  const b = upsertToast({ type: 'default', onDismiss, onAutoClose });
  dismissToast(b);
  dismissToast(b, 'auto');
  expect(onAutoClose).toHaveBeenCalledTimes(1);
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('dismiss without id dismisses every live toast', () => {
  upsertToast({ type: 'default' });
  upsertToast({ type: 'default' });
  dismissToast();
  expect(getToasts().every((t) => t.dismissed)).toBe(true);
});

test('removeToast drops it; unknown id does not notify', () => {
  const id = upsertToast({ type: 'default' });
  const listener = jest.fn();
  const off = subscribe(listener);
  removeToast('nope');
  expect(listener).not.toHaveBeenCalled();
  removeToast(id);
  expect(getToasts()).toHaveLength(0);
  expect(listener).toHaveBeenCalledTimes(1);
  off();
});

test('snapshot is stable between changes; unsubscribe stops notifications', () => {
  upsertToast({ type: 'default' });
  expect(getToasts()).toBe(getToasts());
  const listener = jest.fn();
  const off = subscribe(listener);
  upsertToast({ type: 'default' });
  off();
  upsertToast({ type: 'default' });
  expect(listener).toHaveBeenCalledTimes(1);
});
