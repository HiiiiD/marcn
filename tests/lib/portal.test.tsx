import { Text } from 'react-native';
import { isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { Portal, PortalHost } from '@/registry/marcn/lib/portal';

const hidden = (text: string) => isHiddenFromAccessibility(screen.getByText(text, { includeHiddenElements: true }));

test('warns once in dev and renders nothing without a host', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  render(<Portal><Text>Lost</Text></Portal>);
  render(<Portal><Text>Lost</Text></Portal>);
  expect(screen.queryByText('Lost')).toBeNull();
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});

test('renders portal children outside their parent, in insertion order', () => {
  const ui = (second: boolean) => (
    <PortalHost>
      <Text>App</Text>
      <Portal><Text>layer-1</Text></Portal>
      {second && <Portal><Text>layer-2</Text></Portal>}
    </PortalHost>
  );
  const view = render(ui(false));
  view.rerender(ui(true));
  expect(screen.getAllByText(/layer-/, { includeHiddenElements: true }).map((n) => n.props.children)).toEqual(['layer-1', 'layer-2']);
});

test('updates in place when children change, and removes on unmount', () => {
  const ui = (label: string | null) => (
    <PortalHost>{label && <Portal><Text>{label}</Text></Portal>}</PortalHost>
  );
  const view = render(ui('a'));
  view.rerender(ui('b'));
  expect(screen.queryByText('a')).toBeNull();
  expect(screen.getAllByText('b')).toHaveLength(1);
  view.rerender(ui(null));
  expect(screen.queryByText('b')).toBeNull();
});

test('unmounting the whole tree while a layer is open leaves nothing behind', () => {
  const view = render(<PortalHost><Portal><Text>layer</Text></Portal></PortalHost>);
  view.unmount();
  expect(view.toJSON()).toBeNull();
});

test('a modal layer hides the app and lower layers from accessibility', () => {
  render(
    <PortalHost>
      <Text>App</Text>
      <Portal><Text>lower</Text></Portal>
      <Portal><Text>upper</Text></Portal>
    </PortalHost>,
  );
  expect(hidden('App')).toBe(true);
  expect(hidden('lower')).toBe(true);
  expect(hidden('upper')).toBe(false);
});

test('a non-modal layer hides nothing', () => {
  render(
    <PortalHost>
      <Text>App</Text>
      <Portal modal={false}><Text>pop</Text></Portal>
    </PortalHost>,
  );
  expect(hidden('App')).toBe(false);
  expect(hidden('pop')).toBe(false);
});

test('app is visible again once the modal layer is gone', () => {
  const ui = (open: boolean) => (
    <PortalHost><Text>App</Text>{open && <Portal><Text>layer</Text></Portal>}</PortalHost>
  );
  const view = render(ui(true));
  expect(hidden('App')).toBe(true);
  view.rerender(ui(false));
  expect(hidden('App')).toBe(false);
});
