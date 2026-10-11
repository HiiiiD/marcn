export function Plain({ disabled = false }: { disabled?: boolean }) {
  return null;
}
export function Body(all: { count?: number }) {
  const { count = 3 } = all as { count?: number };
  return null;
}
