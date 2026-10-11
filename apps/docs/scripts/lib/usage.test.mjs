import test from 'node:test';
import assert from 'node:assert/strict';
import { importBlock, parseUsage } from './usage.mjs';

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
