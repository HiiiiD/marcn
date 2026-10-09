import { render, screen } from '@testing-library/react-native';
import { Progress } from '@/registry/marcn/ui/progress';
import { lightColors } from '@/registry/marcn/lib/theme';

test('reports progressbar role and value', () => {
  render(<Progress value={40} />);
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 100, now: 40 });
});

test('indicator width matches the value', () => {
  render(<Progress value={40} />);
  expect(screen.getByTestId('progress-indicator')).toHaveStyle({ width: '40%', backgroundColor: lightColors.primary });
});

test.each([[-20, 0], [150, 100], [NaN, 0], [undefined, 0]])('value %s clamps to %s%%', (input, expected) => {
  render(<Progress value={input as number | undefined} />);
  expect(screen.getByTestId('progress-indicator')).toHaveStyle({ width: `${expected}%` });
  expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: expected });
});
