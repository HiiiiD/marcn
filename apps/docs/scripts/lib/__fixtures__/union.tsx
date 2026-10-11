type A = { type: 'single'; collapsible?: boolean; value?: string };
type B = { type: 'multiple'; value?: string[] };

export function Acc(props: A | B) {
  return null;
}
