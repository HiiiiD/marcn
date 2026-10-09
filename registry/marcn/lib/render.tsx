import { cloneElement, createElement, isValidElement, type ElementType, type ReactElement, type Ref } from 'react';

type AnyProps = Record<string, any>;

export type RenderProp<P, S = {}> = ReactElement | ((props: P, state: S) => ReactElement);

const isHandler = (key: string) => /^on[A-Z]/.test(key);

const isPrevented = (event: any) =>
  !!event && (event.defaultPrevented === true || (typeof event.isDefaultPrevented === 'function' && event.isDefaultPrevented()));

const assign = <T,>(ref: Ref<T>, node: T | null) => {
  if (typeof ref === 'function') return ref(node);
  (ref as { current: T | null }).current = node;
};

// Cached per ref pair so the merged ref keeps its identity across renders; a new one would detach and reattach every render.
const mergedRefs = new WeakMap<object, WeakMap<object, Ref<any>>>();

export function mergeRefs<T>(a: Ref<T> | undefined, b: Ref<T> | undefined): Ref<T> | undefined {
  if (!a || !b) return a ?? b;
  let inner = mergedRefs.get(a);
  if (!inner) mergedRefs.set(a, (inner = new WeakMap()));
  let merged = inner.get(b);
  if (!merged) {
    merged = (node: T | null) => {
      const attached = [a, b].map((ref) => [ref, assign(ref, node)] as const);
      return () => {
        for (const [ref, cleanup] of attached) {
          if (typeof cleanup === 'function') cleanup();
          else assign(ref, null);
        }
      };
    };
    inner.set(b, merged);
  }
  return merged;
}

// `always` lists handlers that must run even when the element prevents the event (internal bookkeeping).
// The rendered element's own props win, except style/handlers/ref (combined) and children (ours); undefined values are ignored.
export function mergeProps(ours: AnyProps, rendered: AnyProps, always: string[] = []): AnyProps {
  const theirs = Object.fromEntries(Object.entries(rendered).filter(([, value]) => value !== undefined));
  const out: AnyProps = { ...ours, ...theirs };
  if (ours.children !== undefined) out.children = ours.children;
  if (typeof theirs.style === 'function') out.style = (state: unknown) => [ours.style, theirs.style(state)];
  else if (ours.style != null || theirs.style != null) out.style = [ours.style, theirs.style];
  for (const key in theirs) {
    if (!isHandler(key)) continue;
    const mine = ours[key];
    const other = theirs[key];
    if (typeof mine === 'function') {
      out[key] = (event: unknown, ...rest: unknown[]) => {
        const result = other(event, ...rest);
        if (always.includes(key) || !isPrevented(event)) mine(event, ...rest);
        return result;
      };
    }
  }
  const ref = mergeRefs(ours.ref, theirs.ref);
  if (ref) out.ref = ref;
  return out;
}

export function renderElement<P extends object, S extends object = {}>(
  Default: ElementType,
  render: RenderProp<P, S> | undefined,
  props: P,
  state?: S,
  always?: string[],
): ReactElement {
  if (typeof render === 'function') return render(props, state ?? ({} as S));
  if (isValidElement(render)) return cloneElement(render as ReactElement<AnyProps>, mergeProps(props, render.props as AnyProps, always));
  return createElement(Default, props);
}
