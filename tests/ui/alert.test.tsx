import { render, screen } from '@testing-library/react-native';
import { Alert, AlertDescription, AlertTitle } from '@/registry/marcn/ui/alert';
import { lightColors } from '@/registry/marcn/lib/theme';

test('has alert role and renders parts', () => {
  render(
    <Alert>
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>Something happened</AlertDescription>
    </Alert>,
  );
  expect(screen.getByRole('alert')).toBeOnTheScreen();
  expect(screen.getByText('Heads up')).toHaveStyle({ fontWeight: '500' });
  expect(screen.getByText('Something happened')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('default surface uses card color and border', () => {
  render(<Alert testID="a" />);
  expect(screen.getByTestId('a')).toHaveStyle({ backgroundColor: lightColors.card, borderColor: lightColors.border });
});

test('destructive variant colors title and description', () => {
  render(
    <Alert variant="destructive">
      <AlertTitle>T</AlertTitle>
      <AlertDescription>D</AlertDescription>
    </Alert>,
  );
  expect(screen.getByText('T')).toHaveStyle({ color: lightColors.destructive });
  expect(screen.getByText('D')).toHaveStyle({ color: lightColors.destructive });
});
