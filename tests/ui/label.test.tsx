import { render, screen } from '@testing-library/react-native';
import { Label } from '@/registry/marcn/ui/label';

test('renders text with medium weight', () => {
  render(<Label>Email</Label>);
  expect(screen.getByText('Email')).toHaveStyle({ fontWeight: '500', fontSize: 14 });
});

test('forwards nativeID', () => {
  render(<Label nativeID="email-label">Email</Label>);
  expect(screen.getByText('Email').props.nativeID).toBe('email-label');
});

test('disabled dims the label', () => {
  render(<Label disabled>Email</Label>);
  expect(screen.getByText('Email')).toHaveStyle({ opacity: 0.5 });
});
