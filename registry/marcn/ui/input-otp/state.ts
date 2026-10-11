export const DIGIT = /^\d$/;

export function sanitizeOtp(text: string, maxLength: number, pattern: RegExp = DIGIT): string {
  let out = '';
  for (const char of text) {
    // A /g or /y regex keeps lastIndex between test() calls and would skip matches.
    pattern.lastIndex = 0;
    if (pattern.test(char)) out += char;
    if (out.length >= maxLength) break;
  }
  return out;
}

export const activeSlot = (length: number, maxLength: number) => Math.min(length, maxLength - 1);
