export type Searchable = { label: string; keywords?: readonly string[] };

export const stripAccents = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');

export const fold = (text: string) => stripAccents(text).toLowerCase();

export function matchesQuery(option: Searchable, query: string) {
  const q = fold(query.trim());
  return !q || [option.label, ...(option.keywords ?? [])].some((text) => fold(text).includes(q));
}

const CONTINUE = 1;
const SPACE_JUMP = 0.9;
const GAP_JUMP = 0.8;
const CHAR_JUMP = 0.17;
const TRANSPOSITION = 0.1;
const SKIPPED = 0.999;
const CASE_MISMATCH = 0.9999;
const NOT_COMPLETE = 0.99;
const KEYWORD_WEIGHT = 0.9;

const IS_GAP = /[\\/_+.#"@[({&]/;
const COUNT_GAPS = /[\\/_+.#"@[({&]/g;
const IS_SPACE = /[\s-]/;
const COUNT_SPACES = /[\s-]/g;

type Run = { text: string; lower: string; abbr: string; lowerAbbr: string; memo: Map<number, number> };

// Subsequence scorer (after cmdk's command-score): consecutive runs and word starts score high, gaps are penalised.
function scoreFrom(run: Run, from: number, at: number): number {
  const { text, lower, abbr, lowerAbbr, memo } = run;
  if (at === abbr.length) return from === text.length ? CONTINUE : NOT_COMPLETE;
  const key = from * (abbr.length + 1) + at;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;

  const ch = lowerAbbr.charAt(at);
  let index = lower.indexOf(ch, from);
  let high = 0;
  while (index >= 0) {
    let score = scoreFrom(run, index + 1, at + 1);
    if (score > high) {
      if (index === from) {
        score *= CONTINUE;
      } else if (IS_GAP.test(text.charAt(index - 1))) {
        score *= GAP_JUMP;
        const breaks = text.slice(from, index - 1).match(COUNT_GAPS);
        if (breaks && from > 0) score *= SKIPPED ** breaks.length;
      } else if (IS_SPACE.test(text.charAt(index - 1))) {
        score *= SPACE_JUMP;
        const breaks = text.slice(from, index - 1).match(COUNT_SPACES);
        if (breaks && from > 0) score *= SKIPPED ** breaks.length;
      } else {
        score *= CHAR_JUMP;
        if (from > 0) score *= SKIPPED ** (index - from);
      }
      if (text.charAt(index) !== abbr.charAt(at)) score *= CASE_MISMATCH;
    }
    const next = lowerAbbr.charAt(at + 1);
    if (
      at + 1 < abbr.length &&
      ((score < TRANSPOSITION && lower.charAt(index - 1) === next) || (next === ch && lower.charAt(index - 1) !== ch))
    ) {
      const transposed = scoreFrom(run, index + 1, at + 2);
      if (transposed * TRANSPOSITION > score) score = transposed * TRANSPOSITION;
    }
    if (score > high) high = score;
    index = lower.indexOf(ch, index + 1);
  }
  memo.set(key, high);
  return high;
}

function scoreText(source: string, abbr: string) {
  const text = stripAccents(source);
  return scoreFrom({ text, lower: text.toLowerCase(), abbr, lowerAbbr: abbr.toLowerCase(), memo: new Map() }, 0, 0);
}

export function commandScore(label: string, query: string, keywords: readonly string[] = []) {
  const abbr = stripAccents(query.trim());
  if (!abbr) return 1;
  return keywords.reduce((best, keyword) => Math.max(best, KEYWORD_WEIGHT * scoreText(keyword, abbr)), scoreText(label, abbr));
}
