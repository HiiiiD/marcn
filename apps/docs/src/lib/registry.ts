import index from '@/generated/registry.json';

export type Item = {
  name: string;
  title: string;
  description: string;
  snackId: string | null;
  kind: 'components' | 'utilities';
  dependencies: string[];
  registryDependencies: string[];
};
export type ItemFile = { path: string; code: string; html: string };
export type Snippet = { code: string; html: string };
export type ApiProp = {
  name: string;
  type: string;
  required: boolean;
  default: string | null;
  description: string;
};
export type ApiPart = { part: string; extends: string[]; props: ApiProp[] };
export type Usage = { import: Snippet; jsx: Snippet; composition: string | null; root: string };
export type ItemData = {
  files: ItemFile[];
  example: Snippet | null;
  usage: Usage | null;
  api: ApiPart[];
};

export const items = [...(index as Item[])].sort((a, b) => a.title.localeCompare(b.title));
export const components = items.filter((i) => i.kind === 'components');
export const utilities = items.filter((i) => i.kind === 'utilities');

export const REPO_URL = 'https://github.com/HiiiiD/marcn';
export const REGISTRY_URL = 'https://hiiiid.github.io/marcn/r/{name}.json';

export async function loadItem(name: string): Promise<ItemData> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  return (await res.json()) as ItemData;
}
