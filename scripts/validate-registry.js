const fs = require('fs');
const path = require('path');

const NS = '@marcn/';
const ALWAYS_ALLOWED = new Set(['react', 'react-native']);

const packageName = (spec) =>
  spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];

function validateRegistry(registry, root = process.cwd()) {
  const errors = [];
  const names = new Set(registry.items.map((i) => i.name));
  const owner = new Map();
  for (const item of registry.items) {
    for (const f of item.files) owner.set(f.path.replace(/\.tsx?$/, ''), item.name);
  }

  for (const item of registry.items) {
    const deps = new Set();
    for (const d of item.registryDependencies ?? []) {
      if (!d.startsWith(NS)) {
        errors.push(`${item.name}: registryDependency "${d}" must start with ${NS}`);
        continue;
      }
      const dep = d.slice(NS.length);
      if (!names.has(dep)) errors.push(`${item.name}: unknown registry dependency "${d}"`);
      deps.add(dep);
    }
    const npmDeps = new Set(item.dependencies ?? []);

    for (const file of item.files) {
      const abs = path.join(root, file.path);
      if (!fs.existsSync(abs)) {
        errors.push(`${item.name}: missing file ${file.path}`);
        continue;
      }
      const src = fs.readFileSync(abs, 'utf8');
      for (const m of src.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
        const spec = m[1];
        if (spec.startsWith('.')) {
          errors.push(`${item.name}: relative import "${spec}" in ${file.path}`);
        } else if (spec.startsWith('@/registry/marcn/')) {
          const target = owner.get(spec.slice(2));
          if (!target) errors.push(`${item.name}: import "${spec}" matches no item`);
          else if (target !== item.name && !deps.has(target)) {
            errors.push(`${item.name}: imports ${target} which is not in registryDependencies`);
          }
        } else {
          const pkg = packageName(spec);
          if (!ALWAYS_ALLOWED.has(pkg) && !npmDeps.has(pkg)) {
            errors.push(`${item.name}: undeclared package ${pkg} in ${file.path}`);
          }
        }
      }
    }
  }
  return errors;
}

module.exports = { validateRegistry };

if (require.main === module) {
  const root = process.cwd();
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'));
  const errors = validateRegistry(registry, root);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log(`registry ok (${registry.items.length} items)`);
}
