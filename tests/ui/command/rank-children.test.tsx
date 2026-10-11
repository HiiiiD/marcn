import { Children, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';
import { commandScore } from '@/registry/marcn/lib/search-filter';
import { itemText, rankChildren, textOf } from '@/registry/marcn/ui/command/rank-children';

type P = { value?: string; keywords?: string[]; children?: ReactNode };
const Item = Object.assign((_: P) => null, { commandKind: 'item' as const });
const Group = Object.assign((_: P) => null, { commandKind: 'group' as const });
const Opaque = (_: P) => null;

const filter = (value: string, search: string, keywords?: readonly string[]) => commandScore(value, search, keywords);
const names = (nodes: ReactNode) =>
  Children.toArray(nodes).map((n) => (isValidElement(n) ? (n as ReactElement<P>).props.value ?? textOf((n as ReactElement<P>).props.children) : String(n)));

describe('textOf / itemText', () => {
  test('joins nested strings and numbers', () => {
    expect(textOf(['Profile', 3, <Opaque key="a">⌘P</Opaque>, null, false])).toBe('Profile3⌘P');
  });

  test('value wins over children', () => {
    expect(itemText({ value: 'v', children: 'text' })).toBe('v');
    expect(itemText({ children: 'text' })).toBe('text');
    expect(itemText({})).toBe('');
  });
});

describe('rankChildren', () => {
  test('no filter, empty or whitespace search returns the children untouched', () => {
    const kids = [<Item key="a" value="b" />, <Item key="b" value="a" />];
    expect(rankChildren(kids, '', filter)).toBe(kids);
    expect(rankChildren(kids, '   ', filter)).toBe(kids);
    expect(rankChildren(kids, 'a', null)).toBe(kids);
  });

  test('drops non-matching items and sorts by score, ties keep JSX order', () => {
    const out = rankChildren(
      [
        <Item key="1" value="Search Calendar" />,
        <Item key="2" value="Profile" />,
        <Item key="3" value="Calendar" />,
        <Item key="4" value="Calculator" />,
      ],
      'cal',
      filter,
    );
    expect(names(out)).toEqual(['Calendar', 'Calculator', 'Search Calendar']);
  });

  test('descends into fragments and keeps keys unique', () => {
    const out = rankChildren(
      <>
        <Item value="Search Calendar" />
        <Fragment>
          <Item value="Calendar" />
        </Fragment>
      </>,
      'cal',
      filter,
    );
    const keys = Children.toArray(out).map((n) => (n as ReactElement).key);
    expect(names(out)).toEqual(['Calendar', 'Search Calendar']);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('sorts groups by their best item and drops groups with no match', () => {
    const out = rankChildren(
      [
        <Group key="g1" value="weak"><Item value="Search Calendar" /></Group>,
        <Group key="g2" value="none"><Item value="Profile" /></Group>,
        <Group key="g3" value="strong"><Item value="Calendar" /></Group>,
      ],
      'cal',
      filter,
    );
    expect(names(out)).toEqual(['strong', 'weak']);
  });

  test('opaque children keep their slot; a group holding one is kept even without direct matches', () => {
    const out = rankChildren(
      [
        <Item key="a" value="Search Calendar" />,
        <Opaque key="o" value="stay" />,
        <Item key="b" value="Calendar" />,
        <Group key="g" value="wrapped"><Opaque value="x" /></Group>,
      ],
      'cal',
      filter,
    );
    expect(names(out)).toEqual(['Calendar', 'stay', 'Search Calendar', 'wrapped']);
  });

  test('a keyword can make an item match', () => {
    const out = rankChildren([<Item key="a" value="America" keywords={['usa']} />, <Item key="b" value="Peru" />], 'usa', filter);
    expect(names(out)).toEqual(['America']);
  });
});
