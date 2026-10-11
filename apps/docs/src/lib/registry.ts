import index from '@/generated/registry.json';

export type Item = {
  name: string;
  title: string;
  description: string;
  kind: 'components' | 'utilities';
  dependencies: string[];
  registryDependencies: string[];
};
export type ItemFile = { path: string; code: string; html: string };

export const items = [...(index as Item[])].sort((a, b) => a.title.localeCompare(b.title));
export const components = items.filter((i) => i.kind === 'components');
export const utilities = items.filter((i) => i.kind === 'utilities');

export const REPO_URL = 'https://github.com/HiiiiD/marcn';
export const REGISTRY_URL = 'https://hiiiid.github.io/marcn/r/{name}.json';

export async function loadFiles(name: string): Promise<ItemFile[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`);
  if (!res.ok) throw new Error(`Failed to load ${name}`);
  return ((await res.json()) as { files: ItemFile[] }).files;
}
