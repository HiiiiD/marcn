import { createRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  type DialogContentProps, type DialogProps,
} from '@/registry/marcn/ui/dialog';
import { mockBackHandler } from '../../back-handler';
import { mockInsets } from '../../insets';

function setup(props: DialogProps = {}, content: DialogContentProps = {}) {
  return render(
    <PortalHost>
      <Dialog {...props}>
        <DialogTrigger><Text>Open</Text></DialogTrigger>
        <DialogContent {...content}>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <Text>Body</Text>
          <DialogFooter><DialogClose><Text>Cancel</Text></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalHost>,
  );
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('is closed by default; the trigger opens it', () => {
  setup();
  expect(screen.queryByText('Body')).toBeNull();
  expect(screen.getByRole('button')).toBeCollapsed();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByText('Body')).toBeOnTheScreen();
  expect(screen.getByText('Description')).toBeOnTheScreen();
  expect(screen.getByRole('header')).toHaveTextContent('Title');
});

test('defaultOpen starts open', () => {
  setup({ defaultOpen: true });
  expect(screen.getByText('Body')).toBeOnTheScreen();
});

test('controlled: notifies but only follows the open prop', () => {
  const onOpenChange = jest.fn();
  setup({ open: false, onOpenChange });
  fireEvent.press(screen.getByText('Open'));
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(screen.queryByText('Body')).toBeNull();
});

test('DialogClose and the corner X close it after the exit animation', () => {
  jest.useFakeTimers();
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, onOpenChange });
  fireEvent.press(screen.getByText('Cancel'));
  fireEvent.press(screen.getByLabelText('Close'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('Body')).toBeNull();
});

test('showCloseButton=false removes the corner X', () => {
  setup({ defaultOpen: true }, { showCloseButton: false });
  expect(screen.queryByLabelText('Close')).toBeNull();
});

test('backdrop dismisses; dismissable=false does not', () => {
  const onOpenChange = jest.fn();
  const view = setup({ defaultOpen: true, onOpenChange });
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
  view.unmount();
  onOpenChange.mockClear();
  setup({ defaultOpen: true, onOpenChange }, { dismissable: false });
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('forwards props and ref to the surface', () => {
  const ref = createRef<View>();
  setup({ defaultOpen: true }, { testID: 'surface', ref });
  expect(screen.getByTestId('surface')).toBeOnTheScreen();
  expect(ref.current).not.toBeNull();
});

test('render function receives the merged props', () => {
  const seen = jest.fn();
  setup({ defaultOpen: true }, {
    render: (props) => {
      seen(props);
      return <View {...props} testID="custom" />;
    },
  });
  expect(screen.getByTestId('custom')).toBeOnTheScreen();
  expect(seen).toHaveBeenCalled();
});

test('a dialog opened from inside a dialog stacks; back closes only the inner one', () => {
  const back = mockBackHandler();
  const inner = jest.fn();
  render(
    <PortalHost>
      <Dialog defaultOpen>
        <DialogContent>
          <Text>outer</Text>
          <Dialog defaultOpen onOpenChange={inner}>
            <DialogContent><Text>inner</Text></DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </PortalHost>,
  );
  back.press();
  expect(inner).toHaveBeenCalledWith(false);
  expect(screen.getByText('outer', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('closing the lower dialog while the upper stays open leaves the upper mounted', () => {
  jest.useFakeTimers();
  let setLower: (v: boolean) => void = () => {};
  function Harness() {
    const [open, set] = useState(true);
    setLower = set;
    return (
      <PortalHost>
        <Dialog open={open}>
          <DialogContent><Text>lower</Text></DialogContent>
        </Dialog>
        <Dialog defaultOpen>
          <DialogContent><Text>upper</Text></DialogContent>
        </Dialog>
      </PortalHost>
    );
  }
  render(<Harness />);
  act(() => setLower(false));
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('lower', { includeHiddenElements: true })).toBeNull();
  expect(screen.getByText('upper')).toBeOnTheScreen();
});

test('parts throw outside a Dialog', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<DialogTitle>x</DialogTitle>)).toThrow(/within a Dialog, Popover or Sheet/);
});

test('plain string content and trigger are wrapped in Text', () => {
  render(
    <PortalHost>
      <Dialog defaultOpen>
        <DialogTrigger>Trigger</DialogTrigger>
        <DialogContent>Hello</DialogContent>
      </Dialog>
    </PortalHost>,
  );
  expect(screen.getByText('Hello')).toBeOnTheScreen();
  expect(screen.getByText('Trigger', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('keeps clear of the status and gesture bars', () => {
  mockInsets({ top: 50, bottom: 34 });
  setup({ defaultOpen: true }, { testID: 'dialog' });
  let node = screen.getByTestId('dialog').parent;
  while (node && StyleSheet.flatten(node.props.style)?.paddingTop === undefined) node = node.parent;
  const frame = StyleSheet.flatten(node!.props.style);
  expect(frame.paddingTop).toBe(16 + 50);
  expect(frame.paddingBottom).toBe(16 + 34);
});
