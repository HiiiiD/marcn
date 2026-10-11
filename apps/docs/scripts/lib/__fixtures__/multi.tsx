type A = { multiple?: false; onChange?: (v: string) => void };
type B = { multiple: true; onChange?: (v: string[]) => void };
export function Mu(p: A | B) {
  return null;
}

type Sel<T> = { selected?: T };
export function Gen(p: Sel<Date>) {
  return null;
}
