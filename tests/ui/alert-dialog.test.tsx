import { createRef } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, type AlertDialogContentProps, type AlertDialogProps,
} from '@/registry/marcn/ui/alert-dialog';
import { mockBackHandler } from '../back-handler';

type Actions = { onAction?: () => void; onCancel?: () => void; cancelRef?: React.Ref<View> };

function setup(props: AlertDialogProps = {}, content: AlertDialogContentProps = {}, actions: Actions = {}) {
  return render(
    <PortalHost>
      <AlertDialog {...props}>
        <AlertDialogTrigger><Text>Open</Text></AlertDialogTrigger>
        <AlertDialogContent testID="surface" {...content}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel ref={actions.cancelRef} onPress={actions.onCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onPress={actions.onAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalHost>,
  );
}

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('opens from the trigger and shows title and description', () => {
  setup();
  expect(screen.queryByText('Are you sure?')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByRole('header')).toHaveTextContent('Are you sure?');
  expect(screen.getByText('This cannot be undone.')).toBeOnTheScreen();
});

test('has no corner close button and exposes the alertdialog role', () => {
  setup({ defaultOpen: true });
  expect(screen.queryByLabelText('Close')).toBeNull();
  expect(screen.getByTestId('surface').props.role).toBe('alertdialog');
});

test('backdrop tap does not dismiss; Android back does', () => {
  const back = mockBackHandler();
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, onOpenChange });
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  expect(onOpenChange).not.toHaveBeenCalled();
  back.press();
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('Action and Cancel call their handlers and close', () => {
  jest.useFakeTimers();
  const onAction = jest.fn();
  const onCancel = jest.fn();
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, onOpenChange }, {}, { onAction, onCancel });
  fireEvent.press(screen.getByText('Continue'));
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('Continue')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  fireEvent.press(screen.getByText('Cancel'));
  expect(onCancel).toHaveBeenCalledTimes(1);
});

test('moves accessibility focus to Cancel on open', () => {
  const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
  const cancelRef = createRef<View>();
  setup({}, {}, { cancelRef });
  fireEvent.press(screen.getByText('Open'));
  expect(cancelRef.current).not.toBeNull();
  expect(focus).toHaveBeenCalledWith(cancelRef.current, 'focus');
});

test('initialFocusRef overrides the Cancel default', () => {
  const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
  const custom = createRef<View>();
  render(
    <PortalHost>
      <AlertDialog defaultOpen>
        <AlertDialogContent initialFocusRef={custom}>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <View ref={custom}><Text>Custom</Text></View>
        </AlertDialogContent>
      </AlertDialog>
    </PortalHost>,
  );
  expect(custom.current).not.toBeNull();
  expect(focus).toHaveBeenCalledWith(custom.current, 'focus');
});

test('forwards ref to the surface', () => {
  const ref = createRef<View>();
  setup({ defaultOpen: true }, { ref });
  expect(ref.current).not.toBeNull();
});

test('without a Cancel button focus falls back to the dialog itself', () => {
  const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
  render(
    <PortalHost>
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogAction>Ok</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </PortalHost>,
  );
  const targets = focus.mock.calls.map(([node]) => (node as unknown as { props: { testID?: string } }).props.testID);
  expect(targets).toContain('overlay-content');
});
