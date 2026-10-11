/**
 * @jest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
const { validateRegistry } = require('../../scripts/validate-registry');

function setup(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'marcn-'));
  for (const [p, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
    fs.writeFileSync(path.join(root, p), content);
  }
  return root;
}

const item = (over: object) => ({
  name: 'a', type: 'registry:ui', title: 'A', description: 'a',
  files: [{ path: 'registry/marcn/ui/a.tsx', type: 'registry:ui' }], ...over,
});

test('valid registry has no errors', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': "import { View } from 'react-native';" });
  expect(validateRegistry({ items: [item({})] }, root)).toEqual([]);
});

test('reports missing file', () => {
  const root = setup({});
  expect(validateRegistry({ items: [item({})] }, root)[0]).toMatch(/missing file/);
});

test('reports unknown registry dependency', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': '' });
  const errors = validateRegistry({ items: [item({ registryDependencies: ['@marcn/nope'] })] }, root);
  expect(errors[0]).toMatch(/unknown registry dependency/);
});

test('reports registryDependencies that are not namespaced', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': '' });
  const errors = validateRegistry({ items: [item({ registryDependencies: ['button'] })] }, root);
  expect(errors[0]).toMatch(/must start with @marcn\//);
});

test('reports relative imports', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': "import x from './b';" });
  expect(validateRegistry({ items: [item({})] }, root)[0]).toMatch(/relative import/);
});

test('reports undeclared npm package', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': "import x from 'left-pad';" });
  expect(validateRegistry({ items: [item({})] }, root)[0]).toMatch(/undeclared package left-pad/);
});

test('accepts declared npm package and scoped names', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': "import x from '@scope/pkg/sub';" });
  expect(validateRegistry({ items: [item({ dependencies: ['@scope/pkg'] })] }, root)).toEqual([]);
});

test('reports registry import of an item not in registryDependencies', () => {
  const root = setup({
    'registry/marcn/ui/a.tsx': "import { T } from '@/registry/marcn/ui/b';",
    'registry/marcn/ui/b.tsx': '',
  });
  const b = item({ name: 'b', files: [{ path: 'registry/marcn/ui/b.tsx', type: 'registry:ui' }] });
  expect(validateRegistry({ items: [item({}), b] }, root)[0]).toMatch(/not in registryDependencies/);
});

test('reports registry import that matches no item', () => {
  const root = setup({ 'registry/marcn/ui/a.tsx': "import { T } from '@/registry/marcn/ui/zzz';" });
  expect(validateRegistry({ items: [item({})] }, root)[0]).toMatch(/matches no item/);
});

test('rejects files named like a folder item or reusing a stem across .ts and .tsx', () => {
  const root = setup({
    'registry/marcn/ui/a/index.tsx': '',
    'registry/marcn/ui/b/a.tsx': '',
    'registry/marcn/ui/b/index.tsx': '',
    'registry/marcn/ui/b/x.ts': '',
    'registry/marcn/ui/c/x.tsx': '',
  });
  const f = (p: string) => ({ path: `registry/marcn/ui/${p}`, type: 'registry:ui' });
  const errors = validateRegistry({
    items: [
      item({ name: 'a', files: [f('a/index.tsx')] }),
      item({ name: 'b', files: [f('b/index.tsx'), f('b/a.tsx'), f('b/x.ts')] }),
      item({ name: 'c', files: [f('c/x.tsx')] }),
    ],
  }, root);
  expect(errors.join('\n')).toMatch(/named like registry item "a"/);
  expect(errors.join('\n')).toMatch(/"x" is used as both/);
});

test('rejects tsx files under lib', () => {
  const root = setup({ 'registry/marcn/lib/a.tsx': '' });
  const errors = validateRegistry({ items: [item({ type: 'registry:lib', files: [{ path: 'registry/marcn/lib/a.tsx', type: 'registry:lib' }] })] }, root);
  expect(errors[0]).toMatch(/lib holds only \.ts/);
});
