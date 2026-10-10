import { createRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, type View } from 'react-native';
import { act, fireEvent, isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { Overlay, type OverlayProps } from '@/registry/marcn/lib/overlay';
import { OverlayClose, OverlayRoot, OverlayTrigger, useOverlay, type OverlayRootProps } from '@/registry/marcn/lib/overlay-root';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { mockBackHandler } from '../back-handler';

function Probe() {
  const { open } = useOverlay();
  return <Text>{`probe-${open}`}</Text>;
}

function setup(root: OverlayRootProps = {}, overlay: Partial<OverlayProps> = {}) {
  return render(
    <PortalHost>
      <Text>App</Text>
      <OverlayRoot {...root}>
        <OverlayTrigger><Text>Open</Text></OverlayTrigger>
        <Overlay {...overlay}>
          <Probe />
          <Text>Body</Text>
          <OverlayClose><Text>Done</Text></OverlayClose>
        </Overlay>
      </OverlayRoot>
    </PortalHost>,
  );
}

const appHidden = () => isHiddenFromAccessibility(screen.getByText('App', { includeHiddenElements: true }));

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('renders nothing until opened; context reaches portaled children', () => {
  setup();
  expect(screen.queryByText('Body')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByText('probe-true')).toBeOnTheScreen();
});

test('stays mounted through the exit animation, then unmounts', () => {
  jest.useFakeTimers();
  setup({ defaultOpen: true });
  fireEvent.press(screen.getByText('Done'));
  expect(screen.getByText('Body')).toBeOnTheScreen();
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('Body')).toBeNull();
});

test('reopening during the exit animation keeps the same content mounted', () => {
  jest.useFakeTimers();
  setup({ defaultOpen: true });
  fireEvent.press(screen.getByText('Done'));
  act(() => { jest.advanceTimersByTime(100); });
  fireEvent.press(screen.getByText('Open', { includeHiddenElements: true }));
  act(() => { jest.advanceTimersByTime(400); });
  expect(screen.getByText('Body')).toBeOnTheScreen();
});

test('content updates while open re-render inside the host', () => {
  function Counter() {
    const [n, setN] = useState(0);
    return <Text onPress={() => setN(n + 1)}>{`count-${n}`}</Text>;
  }
  render(
    <PortalHost>
      <OverlayRoot defaultOpen><Overlay><Counter /></Overlay></OverlayRoot>
    </PortalHost>,
  );
  fireEvent.press(screen.getByText('count-0'));
  expect(screen.getByText('count-1')).toBeOnTheScreen();
});

test('backdrop press dismisses', () => {
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, onOpenChange });
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('dismissable=false ignores backdrop, escape and back, but back is still consumed', () => {
  const back = mockBackHandler();
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, onOpenChange }, { dismissable: false });
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  fireEvent(screen.getByTestId('overlay-content'), 'accessibilityEscape');
  expect(back.press()).toBe(true);
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('hardware back and accessibility escape dismiss', () => {
  const back = mockBackHandler();
  const onOpenChange = jest.fn();
  setup({ defaultOpen: true, onOpenChange });
  back.press();
  fireEvent(screen.getByTestId('overlay-content'), 'accessibilityEscape');
  expect(onOpenChange).toHaveBeenCalledTimes(2);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('stacked layers: back closes only the topmost, lower layer survives', () => {
  const back = mockBackHandler();
  const lower = jest.fn();
  const upper = jest.fn();
  render(
    <PortalHost>
      <OverlayRoot defaultOpen onOpenChange={lower}>
        <Overlay>
          <Text>lower</Text>
          <OverlayRoot defaultOpen onOpenChange={upper}>
            <Overlay><Text>upper</Text></Overlay>
          </OverlayRoot>
        </Overlay>
      </OverlayRoot>
    </PortalHost>,
  );
  back.press();
  expect(upper).toHaveBeenCalledWith(false);
  expect(lower).not.toHaveBeenCalled();
  expect(screen.getByText('lower', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('modal hides the app from accessibility', () => {
  setup({ defaultOpen: true });
  expect(appHidden()).toBe(true);
});

test('modal=false does not hide the app', () => {
  setup({ defaultOpen: true }, { modal: false });
  expect(appHidden()).toBe(false);
});

test('moves accessibility focus in on open and back to the trigger after close', () => {
  jest.useFakeTimers();
  const focus = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
  const triggerRef = createRef<View>();
  render(
    <PortalHost>
      <OverlayRoot>
        <OverlayTrigger ref={triggerRef}><Text>Open</Text></OverlayTrigger>
        <Overlay><OverlayClose><Text>Done</Text></OverlayClose></Overlay>
      </OverlayRoot>
    </PortalHost>,
  );
  fireEvent.press(screen.getByText('Open'));
  expect(focus).toHaveBeenCalledWith(expect.anything(), 'focus');
  focus.mockClear();
  fireEvent.press(screen.getByText('Done'));
  act(() => { jest.advanceTimersByTime(200); });
  act(() => { jest.advanceTimersByTime(1); });
  expect(focus).toHaveBeenLastCalledWith(triggerRef.current, 'focus');
});

test('content stops taking taps once closing begins', () => {
  jest.useFakeTimers();
  setup({ defaultOpen: true });
  expect(StyleSheet.flatten(screen.getByTestId('overlay-content').props.style).pointerEvents).toBe('box-none');
  fireEvent.press(screen.getByText('Done'));
  expect(StyleSheet.flatten(screen.getByTestId('overlay-content').props.style).pointerEvents).toBe('none');
});

test('string children of Trigger and Close are wrapped in Text', () => {
  render(
    <PortalHost>
      <OverlayRoot defaultOpen>
        <OverlayTrigger>Open</OverlayTrigger>
        <Overlay><OverlayClose>Shut</OverlayClose></Overlay>
      </OverlayRoot>
    </PortalHost>,
  );
  expect(screen.getByText('Shut')).toBeOnTheScreen();
  expect(screen.getByText('Open', { includeHiddenElements: true })).toBeOnTheScreen();
});
