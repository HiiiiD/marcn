import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { codeToHtml } from 'shiki';
import { createExtractor, extractItem } from './lib/props.mjs';
import { importBlock, parseUsage } from './lib/usage.mjs';
import { buildSnack, saveSnack } from './lib/snack.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.join(here, '..');
const root = path.join(docs, '..', '..');
const built = path.join(root, 'public', 'r');

if (!fs.existsSync(path.join(built, 'button.json'))) {
  console.error('public/r is missing. Run `yarn registry:build` in the repo root first.');
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'));
const dataDir = path.join(docs, 'public', 'data');
const genDir = path.join(docs, 'src', 'generated');
fs.rmSync(dataDir, { recursive: true, force: true });
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(genDir, { recursive: true });

const themes = { light: 'github-light', dark: 'github-dark' };
const highlight = (code, lang) => codeToHtml(code, { lang, themes, defaultColor: false });

const SDK_VERSION = '54.0.0';
const cachePath = path.join(docs, 'snack-ids.json');
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const examplesDir = path.join(docs, 'examples');

async function snackFor(item) {
  const file = path.join(examplesDir, `${item.name}.tsx`);
  if (!fs.existsSync(file)) return null;
  const example = fs.readFileSync(file, 'utf8');
  const snack = buildSnack({ root, items: registry.items, name: item.name, example });
  const hash = crypto.createHash('sha1').update(JSON.stringify([SDK_VERSION, snack])).digest('hex');
  if (cache[item.name]?.hash !== hash) {
    try {
      const id = await saveSnack({
        name: `marcn ${item.name}`,
        description: item.description,
        sdkVersion: SDK_VERSION,
        ...snack,
      });
      cache[item.name] = { hash, id };
    } catch (e) {
      console.warn(`snack for ${item.name} skipped: ${e.message.slice(0, 120)}`);
      return { example, snackId: null };
    }
  }
  return { example, snackId: cache[item.name].id };
}

const usageDir = path.join(docs, 'usage');
const uiFiles = (item) => item.files.map((f) => path.join(root, f.path));
const extractor = createExtractor({
  root,
  files: registry.items.filter((i) => i.type === 'registry:ui').flatMap(uiFiles),
});
const missingUsage = [];

async function usageFor(item, components) {
  const file = path.join(usageDir, `${item.name}.tsx`);
  if (!fs.existsSync(file)) {
    missingUsage.push(item.name);
    return null;
  }
  const jsx = fs.readFileSync(file, 'utf8').trim();
  const { root: rootName, composition } = parseUsage(jsx, `usage/${item.name}.tsx`);
  const imp = importBlock(item.name, components);
  return {
    import: { code: imp, html: await highlight(imp, 'tsx') },
    jsx: { code: jsx, html: await highlight(jsx, 'tsx') },
    composition,
    root: rootName,
  };
}

const index = [];
for (const item of registry.items) {
  const { files } = JSON.parse(fs.readFileSync(path.join(built, `${item.name}.json`), 'utf8'));
  const out = [];
  const toAliases = (c) => c.replaceAll("@/registry/marcn/ui/", "@/components/ui/").replaceAll("@/registry/marcn/lib/", "@/lib/");
  for (const f of files) {
    const lang = f.path.endsWith('.ts') ? 'ts' : 'tsx';
    out.push({
      path: f.target || f.path.replace(/^registry\/marcn\//, ''),
      code: toAliases(f.content),
      html: await highlight(toAliases(f.content), lang),
    });
  }
  const snack = await snackFor(item);
  const example = snack && {
    code: snack.example,
    html: await highlight(snack.example, 'tsx'),
  };
  const isUi = item.type === 'registry:ui';
  const { components, api } = isUi ? extractItem(extractor, uiFiles(item)) : { components: [], api: [] };
  const usage = isUi ? await usageFor(item, components) : null;
  fs.writeFileSync(
    path.join(dataDir, `${item.name}.json`),
    JSON.stringify({ files: out, example, usage, api }),
  );
  index.push({
    snackId: snack?.snackId ?? null,
    name: item.name,
    title: item.title || item.name,
    description: item.description || '',
    snackId: snack?.snackId ?? null,
    kind: item.type === 'registry:ui' ? 'components' : 'utilities',
    dependencies: item.dependencies || [],
    registryDependencies: item.registryDependencies || [],
  });
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
if (missingUsage.length) console.warn(`no usage snippet: ${missingUsage.join(', ')}`);
fs.writeFileSync(path.join(genDir, 'registry.json'), JSON.stringify(index, null, 2));
console.log(`generated ${index.length} items`);
