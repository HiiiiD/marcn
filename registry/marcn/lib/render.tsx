import { cloneElement, createElement, isValidElement, type ElementType, type ReactElement, type Ref } from 'react';

type AnyProps = Record<string, any>;

export type RenderProp<P, S = {}> = ReactElement | ((props: P, state: S) => ReactElement);

const isHandler = (key: string) => /^on[A-Z]/.test(key);

const isPrevented = (event: any) =>
  !!event && (event.defaultPrevented === true || (typeof event.isDefaultPrevented === 'function' && event.isDefaultPrevented()));

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> | undefined {
  const live = refs.filter(Boolean) as Ref<T>[];
  if (live.length < 2) return live[0];
  return (node: T | null) => {
    for (const ref of live) {
      if (typeof ref === 'function') ref(node);
      else (ref as { current: T | null }).current = node;
    }
  };
}

// The rendered element's own props win, except style/handlers/ref (combined) and children (ours); undefined values are ignored.
export function mergeProps(ours: AnyProps, rendered: AnyProps): AnyProps {
  const theirs = Object.fromEntries(Object.entries(rendered).filter(([, value]) => value !== undefined));
  const out: AnyProps = { ...ours, ...theirs };
  if (ours.children !== undefined) out.children = ours.children;
  if (ours.style != null || theirs.style != null) out.style = [ours.style, theirs.style];
  for (const key in theirs) {
    if (!isHandler(key)) continue;
    const mine = ours[key];
    const other = theirs[key];
    if (typeof mine === 'function') {
      out[key] = (event: unknown, ...rest: unknown[]) => {
        const result = other(event, ...rest);
        if (!isPrevented(event)) mine(event, ...rest);
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
): ReactElement {
  if (typeof render === 'function') return render(props, state ?? ({} as S));
  if (isValidElement(render)) return cloneElement(render as ReactElement<AnyProps>, mergeProps(props, render.props as AnyProps));
  return createElement(Default, props);
}
