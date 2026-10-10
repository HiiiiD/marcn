import {
  defaultFilter, filterOptions, flattenItems, isGroup, toOption, toRows, type ComboboxOption,
} from '@/registry/marcn/ui/combobox';

const opt = (label: string, extra: Partial<ComboboxOption> = {}): ComboboxOption => ({ value: label.toLowerCase(), label, ...extra });

describe('toOption', () => {
  test('a string is both value and label', () => {
    expect(toOption('Apple')).toEqual({ value: 'Apple', label: 'Apple' });
  });

  test('an object without a label falls back to its value', () => {
    expect(toOption({ value: 'apple' })).toEqual({ value: 'apple', label: 'apple' });
  });

  test('keeps disabled, keywords and extra fields', () => {
    const item = { value: 'a', label: 'A', disabled: true, keywords: ['x'], icon: 'star' };
    expect(toOption(item)).toEqual(item);
  });
});

describe('defaultFilter', () => {
  test('an empty or blank query matches everything', () => {
    expect(defaultFilter(opt('Apple'), '')).toBe(true);
    expect(defaultFilter(opt('Apple'), '   ')).toBe(true);
  });

  test('matches a case-insensitive substring of the label', () => {
    expect(defaultFilter(opt('Next.js'), 'XT.J')).toBe(true);
    expect(defaultFilter(opt('Next.js'), 'nuxt')).toBe(false);
  });

  test('ignores diacritics on both sides', () => {
    expect(defaultFilter(opt('Crème brûlée'), 'creme brul')).toBe(true);
    expect(defaultFilter(opt('Creme'), 'crème')).toBe(true);
  });

  test('matches keywords', () => {
    expect(defaultFilter(opt('United States', { keywords: ['USA'] }), 'usa')).toBe(true);
  });

  test('trims the query', () => {
    expect(defaultFilter(opt('Remix'), ' rem ')).toBe(true);
  });

  test('does not match the value, only label and keywords', () => {
    expect(defaultFilter({ value: 'id-42', label: 'Remix' }, '42')).toBe(false);
  });
});

describe('filterOptions', () => {
  const options = [opt('Apple'), opt('Banana'), opt('Cherry')];

  test('uses the default filter', () => {
    expect(filterOptions(options, 'an').map((o) => o.label)).toEqual(['Banana']);
  });

  test('accepts a custom filter', () => {
    expect(filterOptions(options, 'c', (o, q) => o.label.toLowerCase().startsWith(q)).map((o) => o.label)).toEqual(['Cherry']);
  });

  test('null disables filtering', () => {
    expect(filterOptions(options, 'zzz', null)).toEqual(options);
  });
});

describe('groups', () => {
  const items = [
    { value: 'Fruits', items: ['Apple', { value: 'b', label: 'Banana', disabled: true }] },
    'Loose',
    { value: 'Veg', items: ['Carrot'] },
  ];

  test('flattenItems returns every leaf option in order', () => {
    expect(flattenItems(items).map((o) => o.label)).toEqual(['Apple', 'Banana', 'Loose', 'Carrot']);
  });

  test('toRows keeps groups and loose items, normalizing the leaves', () => {
    const rows = toRows(items, '');
    expect(rows).toHaveLength(3);
    const [fruits] = rows;
    expect(isGroup(fruits) && fruits.items[1]).toEqual({ value: 'b', label: 'Banana', disabled: true });
    expect(isGroup(rows[1])).toBe(false);
  });

  test('toRows filters inside groups and drops the empty ones', () => {
    const rows = toRows(items, 'an');
    expect(rows).toHaveLength(1);
    expect(isGroup(rows[0]) && rows[0].value).toBe('Fruits');
    expect(isGroup(rows[0]) && rows[0].items.map((o) => o.label)).toEqual(['Banana']);
  });

  test('toRows with a null filter keeps everything', () => {
    expect(toRows(items, 'zzz', null)).toHaveLength(3);
  });
});
