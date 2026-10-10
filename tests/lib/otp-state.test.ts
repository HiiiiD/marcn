import { activeSlot, DIGIT, sanitizeOtp } from '@/registry/marcn/lib/otp-state';

test('keeps only digits and truncates', () => {
  expect(sanitizeOtp('12a3-456789', 6)).toBe('123456');
  expect(sanitizeOtp('', 6)).toBe('');
});
test('custom pattern', () => {
  expect(sanitizeOtp('a1B2', 3, /^[A-Za-z0-9]$/)).toBe('a1B');
});
test('global regex does not skip chars', () => {
  expect(sanitizeOtp('1111', 4, /\d/g)).toBe('1111');
});
test('activeSlot is next empty, clamped to last', () => {
  expect(activeSlot(0, 6)).toBe(0);
  expect(activeSlot(3, 6)).toBe(3);
  expect(activeSlot(6, 6)).toBe(5);
});
test('DIGIT matches a single digit only', () => {
  expect(DIGIT.test('5')).toBe(true);
  expect(DIGIT.test('55')).toBe(false);
});
