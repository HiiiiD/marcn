import { render, screen } from '@testing-library/react-native';
import { Textarea } from '@/registry/marcn/ui/textarea';

test('is multiline with a minimum height and top-aligned text', () => {
  render(<Textarea placeholder="p" />);
  const el = screen.getByPlaceholderText('p');
  expect(el.props.multiline).toBe(true);
  expect(el).toHaveStyle({ minHeight: 64, textAlignVertical: 'top' });
});
