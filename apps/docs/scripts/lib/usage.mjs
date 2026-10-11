import ts from 'typescript';

export function importBlock(name, components) {
  const names = [...components].sort();
  const from = `'@/components/ui/${name}'`;
  const oneLine = `import { ${names.join(', ')} } from ${from};`;
  if (oneLine.length <= 80) return oneLine;
  return `import {\n${names.map((n) => `  ${n},`).join('\n')}\n} from ${from};`;
}

const parse = (code) => ts.createSourceFile('usage.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

// One import line per owning item (the snippet's own item first), limited to names the snippet uses.
export function buildImports(item, code, owners) {
  const used = new Set();
  const visit = (n) => {
    if (ts.isIdentifier(n)) used.add(n.text);
    ts.forEachChild(n, visit);
  };
  visit(parse(code));
  const byItem = new Map();
  for (const name of used) {
    const list = owners.get(name);
    if (!list) continue;
    const owner = list.includes(item) ? item : list[0];
    byItem.set(owner, [...(byItem.get(owner) ?? []), name]);
  }
  const order = [...byItem.keys()].sort((a, b) => (a === item ? -1 : b === item ? 1 : a.localeCompare(b)));
  return order.map((owner) => importBlock(owner, byItem.get(owner))).join('\n');
}

// RN layout wrappers carry no meaning in the composition
const LAYOUT = new Set(['View', 'ScrollView', 'Fragment']);
const isElement = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
const tagOf = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText();

function collect(node, known) {
  const nodes = [];
  const visit = (n) => {
    if (!isElement(n)) return ts.forEachChild(n, visit);
    const children = ts.isJsxElement(n) ? n.children.flatMap((c) => collect(c, known)) : [];
    const name = tagOf(n);
    const isComponent = known ? known.has(name) : /^[A-Z]/.test(name);
    if (isComponent && !LAYOUT.has(name)) nodes.push({ name, children });
    else nodes.push(...children);
  };
  visit(node);
  return nodes;
}

const count = (node) => 1 + node.children.reduce((sum, c) => sum + count(c), 0);

function render(children, prefix = '') {
  return children.flatMap((child, i) => {
    const last = i === children.length - 1;
    const line = `${prefix}${last ? '└── ' : '├── '}${child.name}`;
    return [line, ...render(child.children, prefix + (last ? '    ' : '│   '))];
  });
}

export function parseUsage(code, label, { known } = {}) {
  const sf = parse(code);
  if (sf.parseDiagnostics.length) {
    const message = ts.flattenDiagnosticMessageText(sf.parseDiagnostics[0].messageText, ' ');
    throw new Error(`${label}: ${message}`);
  }
  const roots = collect(sf, known);
  if (!roots.length) throw new Error(`${label}: usage snippet has no component element`);
  if (roots.length > 1) throw new Error(`${label}: usage snippet must have a single root`);
  const [root] = roots;
  const composition = count(root) > 1 ? [root.name, ...render(root.children)].join('\n') : null;
  return { root: root.name, composition };
}
