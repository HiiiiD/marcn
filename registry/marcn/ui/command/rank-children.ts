import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { CommandFilter } from '@/registry/marcn/ui/command/context';

type Kind = 'item' | 'group';
type PartProps = { value?: string; keywords?: readonly string[]; children?: ReactNode };
type Slot = { node: ReactNode; score: number | null };

const kindOf = (element: ReactElement) => (element.type as { commandKind?: Kind }).commandKind;

export function textOf(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      return isValidElement(child) ? textOf((child.props as PartProps).children) : '';
    })
    .join('');
}

export const itemText = ({ value, children }: PartProps) => value ?? textOf(children);

const rekey = (node: ReactNode, prefix: string | null) =>
  isValidElement(node) && prefix != null ? cloneElement(node, { key: `${prefix}/${node.key}` }) : node;

// Items and groups are read from their props; anything else is opaque (kept in place, filtered by its own registration).
function collect(children: ReactNode, search: string, filter: CommandFilter): { slots: Slot[]; opaque: boolean } {
  const slots: Slot[] = [];
  let opaque = false;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      slots.push({ node: child, score: null });
      continue;
    }
    const element = child as ReactElement<PartProps>;
    if (element.type === Fragment) {
      const inner = collect(element.props.children, search, filter);
      opaque = opaque || inner.opaque;
      for (const slot of inner.slots) slots.push({ ...slot, node: rekey(slot.node, element.key) });
      continue;
    }
    const kind = kindOf(element);
    if (kind === 'item') {
      const score = filter(itemText(element.props), search, element.props.keywords);
      if (score > 0) slots.push({ node: element, score });
    } else if (kind === 'group') {
      const inner = collect(element.props.children, search, filter);
      const best = Math.max(0, ...inner.slots.map((slot) => slot.score ?? 0));
      if (best > 0) slots.push({ node: element, score: best });
      else if (inner.opaque) slots.push({ node: element, score: null });
    } else {
      opaque = true;
      slots.push({ node: element, score: null });
    }
  }
  return { slots, opaque };
}

export function rankChildren(children: ReactNode, search: string, filter: CommandFilter | null): ReactNode {
  if (!filter || !search.trim()) return children;
  const { slots } = collect(children, search, filter);
  const sorted = slots
    .flatMap((slot, index) => (slot.score === null ? [] : [{ node: slot.node, score: slot.score, index }]))
    .sort((a, b) => b.score - a.score || a.index - b.index);
  let next = 0;
  return slots.map((slot) => (slot.score === null ? slot.node : sorted[next++].node));
}
