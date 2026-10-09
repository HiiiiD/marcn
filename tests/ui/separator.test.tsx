import { render, screen } from '@testing-library/react-native';
import { Separator } from '@/registry/marcn/ui/separator';
import { lightColors } from '@/registry/marcn/lib/theme';

const hidden = { includeHiddenElements: true };

test('horizontal is a 1px full-width line', () => {
  render(<Separator testID="s" />);
  expect(screen.getByTestId('s', hidden)).toHaveStyle({ height: 1, alignSelf: 'stretch', backgroundColor: lightColors.border });
});

test('vertical is a 1px full-height line', () => {
  render(<Separator testID="s" orientation="vertical" />);
  expect(screen.getByTestId('s', hidden)).toHaveStyle({ width: 1, alignSelf: 'stretch' });
});

test('decorative is hidden from accessibility by default', () => {
  render(<Separator testID="s" />);
  expect(screen.getByTestId('s', hidden).props.accessibilityElementsHidden).toBe(true);
});

test('non-decorative stays visible to accessibility', () => {
  render(<Separator testID="s" decorative={false} />);
  expect(screen.getByTestId('s').props.accessibilityElementsHidden).toBeFalsy();
});
