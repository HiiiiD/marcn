import path from 'node:path';
import ts from 'typescript';

const COMMON = {
  render: 'Replaces the rendered element. Accepts an element or a function `(props, state) => element`.',
  ref: 'Ref to the underlying host element.',
};

const normalize = (file) => file.replaceAll(String.fromCharCode(92), '/');
const isExternal = (node) => normalize(node.getSourceFile().fileName).includes('/node_modules/');

function loadOptions(root) {
  const cfg = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, root);
  return { ...parsed.options, noEmit: true, skipLibCheck: true, types: ['node'] };
}

export function createExtractor({ root, files }) {
  const program = ts.createProgram(files, loadOptions(root));
  const checker = program.getTypeChecker();

  const jsDocDefault = (sym) => {
    const tag = sym.getJsDocTags(checker).find((t) => t.name === 'default');
    return tag?.text ? ts.displayPartsToString(tag.text).trim() : null;
  };

  const printType = (type, node) => {
    const plain = checker.getNonNullableType(type);
    if (plain.isUnion() && plain.types.every((t) => t.isStringLiteral())) {
      return plain.types.map((t) => `'${t.value}'`).join(' | ');
    }
    if (node.type) return node.type.getText().replace(/\s+/g, ' ');
    return checker.typeToString(plain, node, ts.TypeFormatFlags.NoTruncation);
  };

  const collectProps = (type) => {
    const map = new Map(checker.getPropertiesOfType(type).map((s) => [s.name, s]));
    if (type.isUnion()) {
      for (const member of type.types) {
        for (const sym of checker.getPropertiesOfType(member)) if (!map.has(sym.name)) map.set(sym.name, sym);
      }
    }
    return [...map.values()].filter((s) => s.declarations?.some((d) => !isExternal(d)));
  };

  const bindingPatterns = (fn) => {
    const out = [];
    const first = fn.parameters[0]?.name;
    if (first && ts.isObjectBindingPattern(first)) out.push(first);
    if (fn.body && ts.isBlock(fn.body)) {
      for (const stmt of fn.body.statements) {
        if (!ts.isVariableStatement(stmt)) continue;
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isObjectBindingPattern(decl.name)) out.push(decl.name);
        }
      }
    }
    return out;
  };

  const defaultsOf = (fn) => {
    const map = new Map();
    for (const pattern of bindingPatterns(fn)) {
      for (const el of pattern.elements) {
        if (!el.initializer) continue;
        map.set((el.propertyName ?? el.name).getText(), el.initializer.getText());
      }
    }
    return map;
  };

  const baseNames = (typeNode) => {
    const out = new Set();
    const seen = new Set();
    const visit = (n) => {
      if (ts.isTypeReferenceNode(n)) {
        const sym = checker.getSymbolAtLocation(n.typeName);
        const target = sym && sym.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(sym) : sym;
        const decl = target?.declarations?.[0];
        if (decl && isExternal(decl)) {
          if (/Props$/.test(target.name)) out.add(target.name);
        } else if (decl && ts.isTypeAliasDeclaration(decl) && !seen.has(decl)) {
          seen.add(decl);
          visit(decl.type);
        }
        n.typeArguments?.forEach(visit);
        return;
      }
      ts.forEachChild(n, visit);
    };
    if (typeNode) visit(typeNode);
    return [...out];
  };

  const describe = (sym, defaults) => {
    const decl = sym.declarations.find((d) => !isExternal(d)) ?? sym.declarations[0];
    const doc = ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();
    return {
      name: sym.name,
      type: printType(checker.getTypeOfSymbolAtLocation(sym, decl), decl),
      required: !(sym.flags & ts.SymbolFlags.Optional),
      default: defaults.get(sym.name) ?? jsDocDefault(sym),
      description: doc || COMMON[sym.name] || '',
    };
  };

  const toComponent = (exported, sf) => {
    const sym = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (!/^[A-Z]/.test(sym.name) || !(sym.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) return null;
    const type = checker.getTypeOfSymbolAtLocation(sym, sf);
    const fn = type.getCallSignatures()[0]?.declaration;
    if (!fn?.parameters) return null;
    const param = fn.parameters[0];
    if (!param) return { part: exported.name, extends: [], props: [] };
    const defaults = defaultsOf(fn);
    return {
      part: exported.name,
      extends: baseNames(param.type),
      props: collectProps(checker.getTypeAtLocation(param)).map((s) => describe(s, defaults)),
    };
  };

  return {
    extract(file) {
      const sf = program.getSourceFile(file);
      const mod = sf && checker.getSymbolAtLocation(sf);
      if (!mod) return [];
      return checker.getExportsOfModule(mod).flatMap((e) => toComponent(e, sf) ?? []);
    },
  };
}

export function extractItem(extractor, files) {
  const parts = new Map();
  for (const file of files) {
    for (const part of extractor.extract(file)) if (!parts.has(part.part)) parts.set(part.part, part);
  }
  const all = [...parts.values()];
  return {
    components: all.map((p) => p.part),
    api: all.filter((p) => p.props.length || p.extends.length),
  };
}
