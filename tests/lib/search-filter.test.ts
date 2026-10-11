import { commandScore, fold, matchesQuery } from '@/registry/marcn/lib/search-filter';

describe('fold', () => {
  test('strips accents and lowercases', () => {
    expect(fold('Crème BRÛLÉE')).toBe('creme brulee');
  });
});

describe('matchesQuery', () => {
  test('substring on label or keywords, accent and case insensitive', () => {
    expect(matchesQuery({ label: 'Crème brûlée' }, 'CREME BRUL')).toBe(true);
    expect(matchesQuery({ label: 'United States', keywords: ['USA'] }, 'usa')).toBe(true);
    expect(matchesQuery({ label: 'Remix' }, 'nuxt')).toBe(false);
  });

  test('blank query matches everything', () => {
    expect(matchesQuery({ label: 'Remix' }, '   ')).toBe(true);
  });
});

describe('commandScore', () => {
  test('blank query scores 1', () => {
    expect(commandScore('Calendar', '')).toBe(1);
    expect(commandScore('Calendar', '   ')).toBe(1);
  });

  test('an exact same-case match scores 1; no match scores 0', () => {
    expect(commandScore('Calendar', 'Calendar')).toBe(1);
    expect(commandScore('Calendar', 'xyz')).toBe(0);
  });

  test('ranks exact > prefix > word boundary > scattered', () => {
    const exact = commandScore('Calendar', 'calendar');
    const prefix = commandScore('Calendar', 'cal');
    const boundary = commandScore('Search Calendar', 'cal');
    const scattered = commandScore('Practical', 'cal');
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(boundary);
    expect(boundary).toBeGreaterThan(scattered);
    expect(scattered).toBeGreaterThan(0);
  });

  test('hyphen and underscore count as word boundaries', () => {
    expect(commandScore('git-commit', 'com')).toBeGreaterThan(commandScore('recommit', 'com'));
  });

  test('ignores accents and case on both sides', () => {
    expect(commandScore('Crème brûlée', 'CREME')).toBeGreaterThan(0.9);
    expect(commandScore('Creme', 'crème')).toBeGreaterThan(0.9);
  });

  test('keywords match, scored below an equal label match', () => {
    expect(commandScore('America', 'usa')).toBe(0);
    expect(commandScore('America', 'usa', ['USA'])).toBeGreaterThan(0);
    expect(commandScore('USA', 'usa')).toBeGreaterThan(commandScore('America', 'usa', ['USA']));
  });

  test('tolerates an adjacent-letter transposition, scoring it below the correct spelling', () => {
    const typo = commandScore('ab', 'ba');
    expect(typo).toBeGreaterThan(0);
    expect(typo).toBeLessThan(commandScore('ab', 'ab'));
  });

  test('regex-looking characters in the query are literal and never throw', () => {
    expect(commandScore('C++ Guide', 'c++')).toBeGreaterThan(0.9);
    expect(commandScore('a.b', '(')).toBe(0);
    expect(commandScore('a\\b', '\\')).toBeGreaterThan(0);
  });

  test('long inputs finish', () => {
    expect(commandScore('a'.repeat(80), `${'a'.repeat(30)}b`)).toBe(0);
  });
});
