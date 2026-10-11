import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createExtractor, extractItem } from './props.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..', '..');
const fx = (n) => path.join(here, '__fixtures__', n);
const files = ['basic.tsx', 'union.tsx', 'defaults.tsx', 'shared.tsx', 'entry.tsx', 'inner.tsx', 'multi.tsx', 'rn.tsx'].map(fx);
const extractor = createExtractor({ root, files });
const byPart = (parts, name) => parts.find((p) => p.part === name);

test('lists only components, including ones without props', () => {
  const names = extractor.extract(fx('basic.tsx')).map((c) => c.part);
  assert.deepEqual(names, ['Fx', 'Empty']);
});

test('keeps only marcn-declared props and reports the RN base', () => {
  const fxPart = byPart(extractor.extract(fx('basic.tsx')), 'Fx');
  assert.deepEqual(fxPart.props.map((p) => p.name), ['variant', 'size', 'render', 'ref']);
  assert.deepEqual(fxPart.extends, ['PressableProps']);
});

test('expands string unions, reads JSDoc and defaults', () => {
  const fxPart = byPart(extractor.extract(fx('basic.tsx')), 'Fx');
  const variant = fxPart.props.find((p) => p.name === 'variant');
  assert.equal(variant.type, "'default' | 'ghost'");
  assert.equal(variant.default, "'default'");
  assert.equal(variant.description, 'Visual style.');
  assert.equal(variant.required, false);
  assert.equal(fxPart.props.find((p) => p.name === 'size').default, "'md'");
});

test('falls back to shared descriptions for render and ref', () => {
  const fxPart = byPart(extractor.extract(fx('basic.tsx')), 'Fx');
  assert.match(fxPart.props.find((p) => p.name === 'render').description, /element/i);
  assert.match(fxPart.props.find((p) => p.name === 'ref').description, /ref/i);
});

test('discriminated union: merges common and member-only props', () => {
  const acc = byPart(extractor.extract(fx('union.tsx')), 'Acc');
  const names = acc.props.map((p) => p.name).sort();
  assert.deepEqual(names, ['collapsible', 'type', 'value']);
  const type = acc.props.find((p) => p.name === 'type');
  assert.equal(type.type, "'single' | 'multiple'");
  assert.equal(type.required, true);
});

test('defaults from parameter and body destructuring', () => {
  const parts = extractor.extract(fx('defaults.tsx'));
  assert.equal(byPart(parts, 'Plain').props[0].default, 'false');
  assert.equal(byPart(parts, 'Body').props[0].default, '3');
});

test('extractItem dedupes and drops parts with nothing to show', () => {
  const { components, api } = extractItem(extractor, [fx('basic.tsx'), fx('basic.tsx')]);
  assert.deepEqual(components, ['Fx', 'Empty']);
  assert.deepEqual(api.map((p) => p.part), ['Fx']);
});

test('prints declared type text instead of expanding aliases', () => {
  const fxPart = byPart(extractor.extract(fx('basic.tsx')), 'Fx');
  assert.equal(fxPart.props.find((p) => p.name === 'ref').type, 'Ref<View>');
});

test('shared descriptions fill gaps but never override JSDoc', () => {
  const sh = byPart(extractor.extract(fx('shared.tsx')), 'Sh');
  const desc = (n) => sh.props.find((p) => p.name === n).description;
  assert.equal(desc('open'), 'Controlled open state.');
  assert.equal(desc('custom'), '');
  assert.equal(desc('side'), 'Own text.');
});

test('extractItem lists only what the entry module exports', () => {
  const { components, api, exports } = extractItem(extractor, [fx('entry.tsx'), fx('inner.tsx')]);
  assert.deepEqual(components, ['Pub']);
  assert.deepEqual(api, []);
  assert.deepEqual(exports.sort(), ['Pub', 'helper']);
});

test('union members with different types print every variant', () => {
  const mu = byPart(extractor.extract(fx('multi.tsx')), 'Mu');
  assert.equal(mu.props.find((p) => p.name === 'multiple').type, 'false | true');
  assert.equal(
    mu.props.find((p) => p.name === 'onChange').type,
    '((v: string) => void) | ((v: string[]) => void)',
  );
});

test('generic type parameters are resolved instead of leaked', () => {
  const gen = byPart(extractor.extract(fx('multi.tsx')), 'Gen');
  assert.equal(gen.props[0].type, 'Date');
});

test('docs from RN declarations do not leak into redeclared props', () => {
  const tx = byPart(extractor.extract(fx('rn.tsx')), 'Tx');
  assert.equal(tx.props.find((p) => p.name === 'disabled').description, 'Disables interaction.');
});
