import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImports, importBlock, parseUsage } from './usage.mjs';

test('importBlock stays on one line when short', () => {
  assert.equal(importBlock('button', ['Button']), "import { Button } from '@/components/ui/button';");
});

test('importBlock sorts and wraps long lists', () => {
  const out = importBlock('accordion', ['Accordion', 'AccordionTrigger', 'AccordionItem', 'AccordionContent']);
  assert.equal(
    out,
    "import {\n  Accordion,\n  AccordionContent,\n  AccordionItem,\n  AccordionTrigger,\n} from '@/components/ui/accordion';",
  );
});

const accordion = `<Accordion type="single">
  <AccordionItem value="a">
    <AccordionTrigger>Q</AccordionTrigger>
    <AccordionContent>A</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionTrigger>Q</AccordionTrigger>
    <AccordionContent>A</AccordionContent>
  </AccordionItem>
</Accordion>`;

test('composition tree uses connectors and keeps repeated siblings', () => {
  const { root, composition } = parseUsage(accordion, 'accordion');
  assert.equal(root, 'Accordion');
  assert.equal(
    composition,
    [
      'Accordion',
      '├── AccordionItem',
      '│   ├── AccordionTrigger',
      '│   └── AccordionContent',
      '└── AccordionItem',
      '    ├── AccordionTrigger',
      '    └── AccordionContent',
    ].join('\n'),
  );
});

test('host elements and expressions are transparent', () => {
  const { composition } = parseUsage(
    `<Card><View><CardHeader /></View>{items.map((i) => <CardContent key={i} />)}</Card>`,
    'card',
  );
  assert.equal(composition, ['Card', '├── CardHeader', '└── CardContent'].join('\n'));
});

test('single component has no composition', () => {
  const { root, composition } = parseUsage(`<Button variant="outline">Hi</Button>`, 'button');
  assert.equal(root, 'Button');
  assert.equal(composition, null);
});

test('throws with the label when there is no component', () => {
  assert.throws(() => parseUsage(`<View />`, 'broken'), /broken: usage snippet has no component element/);
  assert.throws(() => parseUsage(`const x = 1;`, 'broken'), /broken/);
});

test('syntax errors fail with the label', () => {
  assert.throws(() => parseUsage('<Button>hi</Button', 'broken'), /broken/);
});

test('more than one root fails', () => {
  assert.throws(() => parseUsage('<><Toaster /><Button /></>', 'multi'), /multi: usage snippet must have a single root/);
});

test('known names limit what counts as a component', () => {
  const known = new Set(['AspectRatio']);
  const { composition } = parseUsage('<AspectRatio><Image source={s} /></AspectRatio>', 'ar', { known });
  assert.equal(composition, null);
});

test('buildImports groups used names by owning item, own item first', () => {
  const owners = new Map([
    ['Dialog', ['dialog']],
    ['DialogContent', ['dialog']],
    ['Button', ['button']],
    ['Text', ['text']],
    ['toast', ['sonner']],
  ]);
  const code = '<Dialog><DialogContent><Button onPress={() => toast("x")}>Go</Button><Image /></DialogContent></Dialog>';
  assert.equal(
    buildImports('dialog', code, owners),
    [
      "import { Dialog, DialogContent } from '@/components/ui/dialog';",
      "import { Button } from '@/components/ui/button';",
      "import { toast } from '@/components/ui/sonner';",
    ].join('\n'),
  );
});
