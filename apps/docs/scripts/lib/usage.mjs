import ts from 'typescript';

export function importBlock(name, components) {
  const names = [...components].sort();
  const from = `'@/components/ui/${name}'`;
  const oneLine = `import { ${names.join(', ')} } from ${from};`;
  if (oneLine.length <= 80) return oneLine;
  return `import {\n${names.map((n) => `  ${n},`).join('\n')}\n} from ${from};`;
}

// RN layout wrappers carry no meaning in the composition
const LAYOUT = new Set(['View', 'ScrollView', 'Fragment']);
const isElement = (n) => ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n);
const tagOf = (n) => (ts.isJsxElement(n) ? n.openingElement.tagName : n.tagName).getText();

function collect(node) {
  const nodes = [];
  const visit = (n) => {
    if (!isElement(n)) return ts.forEachChild(n, visit);
    const children = ts.isJsxElement(n) ? n.children.flatMap(collect) : [];
    const name = tagOf(n);
    if (/^[A-Z]/.test(name) && !LAYOUT.has(name)) nodes.push({ name, children });
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

export function parseUsage(code, label) {
  const sf = ts.createSourceFile('usage.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const [root] = collect(sf);
  if (!root) throw new Error(`${label}: usage snippet has no component element`);
  const composition = count(root) > 1 ? [root.name, ...render(root.children)].join('\n') : null;
  return { root: root.name, composition };
}
