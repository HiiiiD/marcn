import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeToHtml } from 'shiki';

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
  fs.writeFileSync(path.join(dataDir, `${item.name}.json`), JSON.stringify({ files: out }));
  index.push({
    name: item.name,
    title: item.title || item.name,
    description: item.description || '',
    kind: item.type === 'registry:ui' ? 'components' : 'utilities',
    dependencies: item.dependencies || [],
    registryDependencies: item.registryDependencies || [],
  });
}

fs.writeFileSync(path.join(genDir, 'registry.json'), JSON.stringify(index, null, 2));
console.log(`generated ${index.length} items`);
