import fs from 'node:fs';
import path from 'node:path';

// Snack runs an older Expo SDK than the registry pins. Native modules must match Expo Go, so they
// are left unversioned (Snack picks the SDK's version); lucide 1.x fails to bundle on snackager.
const SDK_BUNDLED = new Set([
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-svg',
  'react-native-safe-area-context',
  'react-native-worklets',
]);
const VERSION_OVERRIDES = { 'lucide-react-native': '0.544.0' };

const rel = (from, to) => {
  const r = path.posix.relative(path.posix.dirname(from), to);
  return r.startsWith('.') ? r : `./${r}`;
};

const destOf = (registryPath) => {
  const m = registryPath.match(/^registry\/marcn\/(ui|lib)\/(.+)$/);
  return m[1] === 'ui' ? `components/ui/${m[2]}` : `lib/${m[2]}`;
};

const ALIAS = /^@\/(?:registry\/marcn\/)?(ui|lib|components\/ui)\/(.+)$/;
const IMPORT = /(from\s+|import\s+)(['"])(@\/[^'"]+)\2/g;

// Snack's parser rejects numeric literal types (`0 | 1 | 2`, `1 | -1`); widen them in the Snack copy only.
const NUMERIC_UNION = /(:\s*)-?\d+(?:\s*\|\s*-?\d+)+/g;

const rewrite = (code, from) =>
  code.replace(NUMERIC_UNION, '$1number').replace(IMPORT, (all, kw, q, spec) => {
    const m = spec.match(ALIAS);
    if (!m) return all;
    const target = m[1] === 'lib' ? `lib/${m[2]}` : `components/ui/${m[2]}`;
    return `${kw}${q}${rel(from, target)}${q}`;
  });

const closure = (items, name, seen = new Set()) => {
  if (seen.has(name)) return seen;
  seen.add(name);
  const item = items.find((i) => i.name === name);
  for (const d of item.registryDependencies || []) closure(items, d.replace('@marcn/', ''), seen);
  return seen;
};

export function buildSnack({ root, items, name, example }) {
  const names = new Set();
  const wanted = [name];
  for (const m of example.matchAll(/from\s+['"]@\/(?:components\/ui|lib)\/([^/'"]+)/g)) {
    wanted.push(m[1]);
  }
  for (const n of wanted) if (items.some((i) => i.name === n)) closure(items, n, names);
  const raw = {};
  const dependencies = {};
  for (const n of names) {
    const item = items.find((i) => i.name === n);
    for (const dep of item.dependencies || []) {
      const at = dep.lastIndexOf('@');
      const pkg = dep.slice(0, at);
      dependencies[pkg] = SDK_BUNDLED.has(pkg)
        ? { version: '*' }
        : { version: VERSION_OVERRIDES[pkg] ?? dep.slice(at + 1) };
    }
    const built = JSON.parse(fs.readFileSync(path.join(root, 'public', 'r', `${n}.json`), 'utf8'));
    for (const f of built.files) raw[destOf(f.path)] = f.content;
  }

  const files = {};
  for (const [dest, content] of Object.entries(raw)) {
    files[dest] = { type: 'CODE', contents: rewrite(content, dest) };
  }

  const has = (dep) => dependencies[dep] !== undefined;
  const imports = [];
  let tree = `<View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 48 }} keyboardShouldPersistTaps="handled">
          <Example />
        </ScrollView>
      </View>`;
  if (names.has('portal')) {
    imports.push("import { PortalHost } from './components/ui/portal';");
    tree = `<PortalHost>${tree}</PortalHost>`;
  }
  if (has('react-native-gesture-handler')) {
    imports.push("import { GestureHandlerRootView } from 'react-native-gesture-handler';");
    tree = `<GestureHandlerRootView style={{ flex: 1 }}>${tree}</GestureHandlerRootView>`;
  }
  if (has('react-native-safe-area-context')) {
    imports.push("import { SafeAreaProvider } from 'react-native-safe-area-context';");
    tree = `<SafeAreaProvider>${tree}</SafeAreaProvider>`;
  }

  files['App.tsx'] = {
    type: 'CODE',
    contents: `import { ScrollView, View } from 'react-native';
import { useTheme } from './lib/theme';
import Example from './Example';
${imports.join('\n')}

export default function App() {
  const { colors } = useTheme();
  return (
    ${tree}
  );
}
`,
  };
  files['Example.tsx'] = { type: 'CODE', contents: rewrite(example, 'Example.tsx') };
  return { files, dependencies };
}

export async function saveSnack({ name, description, sdkVersion, files, dependencies }) {
  const res = await fetch('https://exp.host/--/api/v2/snack/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Snack-Api-Version': '3.0.0' },
    body: JSON.stringify({
      manifest: { name, description, sdkVersion },
      code: files,
      dependencies,
    }),
  });
  if (!res.ok) throw new Error(`snack save failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).id;
}
