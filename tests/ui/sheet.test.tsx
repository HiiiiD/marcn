import { Keyboard, StyleSheet, Text } from 'react-native';
import { act, fireEvent, isHiddenFromAccessibility, render, screen } from '@testing-library/react-native';
import { State } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import { PortalHost } from '@/registry/marcn/lib/portal';
import { Dialog, DialogContent, DialogTrigger } from '@/registry/marcn/ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, type SheetContentProps } from '@/registry/marcn/ui/sheet';
import { mockBackHandler } from '../back-handler';
import { mockInsets } from '../insets';

function setup(props: { onOpenChange?: (o: boolean) => void; defaultOpen?: boolean } = {}, content: SheetContentProps = {}) {
  return render(
    <PortalHost>
      <Sheet defaultOpen {...props}>
        <SheetTrigger><Text>Open</Text></SheetTrigger>
        <SheetContent testID="sheet" {...content}>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
          <Text>Body</Text>
          <SheetClose><Text>Done</Text></SheetClose>
        </SheetContent>
      </Sheet>
    </PortalHost>,
  );
}

const drag = (translation: { translationX?: number; translationY?: number }, velocity = {}) =>
  fireGestureHandler(getByGestureTestId('sheet-handle'), [
    { state: State.BEGAN },
    { state: State.ACTIVE, ...translation },
    { state: State.END, ...translation, ...velocity },
  ]);

const surface = () => StyleSheet.flatten(screen.getByTestId('sheet').props.style);

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('opens from the trigger and renders title and description', () => {
  setup({ defaultOpen: false });
  expect(screen.queryByText('Body')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByRole('header')).toHaveTextContent('Title');
  expect(screen.getByText('Description')).toBeOnTheScreen();
});

test('SheetClose closes it', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  fireEvent.press(screen.getByText('Done'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('the backdrop closes it', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  fireEvent.press(screen.getByTestId('overlay-backdrop'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('dragging the handle far enough dismisses', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  drag({ translationY: 700 });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('a fast flick dismisses even with a short drag', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  drag({ translationY: 40 }, { velocityY: 1500 });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('a short slow drag springs back', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  drag({ translationY: 40 }, { velocityY: 50 });
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('dragging the wrong way never dismisses', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  drag({ translationY: -700 });
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('left sheets dismiss by dragging left', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange }, { side: 'left', showHandle: true });
  drag({ translationX: -700 });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('showHandle=false removes the drag handle', () => {
  setup({}, { showHandle: false });
  expect(() => getByGestureTestId('sheet-handle')).toThrow();
});

test('snapPoints sizes the sheet as a fraction of the window or in pixels', () => {
  const view = setup({}, { snapPoints: [0.5] });
  expect(surface().height).toBe(667);
  view.unmount();
  setup({}, { snapPoints: [320] });
  expect(surface().height).toBe(320);
});

test('side sets edge placement', () => {
  setup({}, { side: 'right' });
  expect(surface()).toMatchObject({ right: 0, top: 0, bottom: 0 });
});

test('a Dialog opened from a Sheet sits above it; back closes only the dialog', () => {
  jest.useFakeTimers();
  const back = mockBackHandler();
  const sheet = jest.fn();
  render(
    <PortalHost>
      <Sheet defaultOpen onOpenChange={sheet}>
        <SheetContent>
          <Text>sheet-body</Text>
          <Dialog>
            <DialogTrigger><Text>Open dialog</Text></DialogTrigger>
            <DialogContent><Text>dialog-body</Text></DialogContent>
          </Dialog>
        </SheetContent>
      </Sheet>
    </PortalHost>,
  );
  fireEvent.press(screen.getByText('Open dialog'));
  expect(screen.getByText('dialog-body')).toBeOnTheScreen();
  act(() => { back.press(); });
  expect(sheet).not.toHaveBeenCalled();
  act(() => { jest.advanceTimersByTime(200); });
  expect(screen.queryByText('dialog-body')).toBeNull();
  expect(screen.getByText('sheet-body')).toBeOnTheScreen();
});

test('with the keyboard already up, a bottom sheet limits its height to the space above it', () => {
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  jest.spyOn(Keyboard, 'metrics').mockReturnValue({ screenX: 0, screenY: 1034, width: 750, height: 300 });
  setup();
  expect(surface().maxHeight).toBeCloseTo((1334 - 300) * 0.9);
});

test('plain string content is wrapped in Text', () => {
  render(
    <PortalHost>
      <Sheet defaultOpen>
        <SheetContent>Hello</SheetContent>
      </Sheet>
    </PortalHost>,
  );
  expect(screen.getByText('Hello')).toBeOnTheScreen();
});

test('a bottom sheet pads for the gesture bar and stays under the status bar', () => {
  mockInsets({ top: 40, bottom: 34 });
  setup();
  expect(surface().paddingBottom).toBe(34);
  expect(surface().maxHeight).toBeCloseTo((1334 - 40) * 0.9);
});

test('a bottom sheet lifted by the keyboard needs no gesture-bar padding', () => {
  mockInsets({ bottom: 34 });
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  jest.spyOn(Keyboard, 'metrics').mockReturnValue({ screenX: 0, screenY: 1034, width: 750, height: 300 });
  setup();
  expect(surface().paddingBottom).toBe(0);
});

test('a top sheet pads for the status bar', () => {
  mockInsets({ top: 40, bottom: 34 });
  setup({}, { side: 'top' });
  expect(surface().paddingTop).toBe(40);
});

test('a right sheet pads top, bottom and its edge', () => {
  mockInsets({ top: 40, bottom: 34, right: 20, left: 10 });
  setup({}, { side: 'right' });
  expect(surface()).toMatchObject({ paddingTop: 40, paddingBottom: 34, paddingRight: 20 });
});

// The reanimated mock never advances the open progress, so the slide-in term is the whole window height.
const offset = () => (surface().transform[0].translateY as number) - 1334;

test("'auto' snap point measures the content, then sizes the sheet to it", () => {
  setup({}, { snapPoints: ['auto'] });
  expect(surface().height).toBeUndefined();
  fireEvent(screen.getByTestId('sheet'), 'layout', { nativeEvent: { layout: { width: 375, height: 240 } } });
  expect(surface().height).toBeUndefined();
});

test("'auto' follows the content once a larger snap has fixed the sheet's size", () => {
  const layout = (id: string, height: number) =>
    fireEvent(screen.getByTestId(id), 'layout', { nativeEvent: { layout: { width: 375, height } } });
  setup({}, { snapPoints: ['auto', 500] });
  layout('sheet-body', 100);
  layout('sheet', 160);
  expect(surface().height).toBe(500);
  layout('sheet-body', 300);
  expect(surface().height).toBe(500);
  layout('sheet-body', 450);
  expect(surface().height).toBeUndefined();
});

test("'auto' alone leaves the surface unsized so it keeps reporting the content's size", () => {
  setup({}, { snapPoints: ['auto'] });
  fireEvent(screen.getByTestId('sheet'), 'layout', { nativeEvent: { layout: { width: 375, height: 240 } } });
  expect(surface().height).toBeUndefined();
});

test('with several snapPoints the sheet is as tall as the largest, sorted or not', () => {
  setup({}, { snapPoints: [0.8, 0.4] });
  expect(surface().height).toBeCloseTo(0.8 * 1334);
});

test('opens at the first snap point, lowered by the gap to the largest', () => {
  setup({}, { snapPoints: [0.4, 0.8] });
  expect(offset()).toBeCloseTo(0.4 * 1334);
});

test('defaultSnapIndex opens at a larger snap point', () => {
  setup({}, { snapPoints: [0.4, 0.8], defaultSnapIndex: 1 });
  expect(offset()).toBe(0);
});

test('dragging up from the lowest snap moves to the larger one and reports it', () => {
  const onSnapIndexChange = jest.fn();
  const onOpenChange = jest.fn();
  setup({ onOpenChange }, { snapPoints: [0.4, 0.8], onSnapIndexChange });
  act(() => drag({ translationY: -400 }));
  expect(onSnapIndexChange).toHaveBeenCalledWith(1);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(offset()).toBe(0);
});

test('dragging down from the largest snap lands on the lower one without dismissing', () => {
  const onSnapIndexChange = jest.fn();
  const onOpenChange = jest.fn();
  setup({ onOpenChange }, { snapPoints: [0.4, 0.8], defaultSnapIndex: 1, onSnapIndexChange });
  drag({ translationY: 400 });
  expect(onSnapIndexChange).toHaveBeenCalledWith(0);
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('dragging down far from the lowest snap dismisses', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange }, { snapPoints: [0.4, 0.8] });
  drag({ translationY: 400 });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('stretching past the largest size neither dismisses nor changes snap, and springs back', () => {
  const onSnapIndexChange = jest.fn();
  const onOpenChange = jest.fn();
  setup({ onOpenChange }, { snapPoints: [0.4, 0.8], defaultSnapIndex: 1, onSnapIndexChange });
  drag({ translationY: -300 });
  expect(onSnapIndexChange).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(offset()).toBe(0);
});

test('a content-sized sheet can be stretched and springs back to rest', () => {
  const onOpenChange = jest.fn();
  setup({ onOpenChange });
  drag({ translationY: -300 });
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(offset()).toBe(0);
});

test('the stretch filler sits behind the open edge, hidden from screen readers', () => {
  setup();
  const filler = screen.getByTestId('sheet-stretch', { includeHiddenElements: true });
  expect(StyleSheet.flatten(filler.props.style)).toMatchObject({ top: '100%' });
  expect(isHiddenFromAccessibility(filler)).toBe(true);
});

test('with several snap points the handle is an adjustable that steps through them', () => {
  const onSnapIndexChange = jest.fn();
  setup({}, { snapPoints: [0.3, 0.6, 0.9], onSnapIndexChange });
  const handle = screen.getByRole('adjustable');
  expect(handle.props.accessibilityActions.map((a: { name: string }) => a.name)).toEqual(['increment', 'decrement']);
  expect(handle.props.accessibilityValue).toEqual({ text: '1 of 3' });
  act(() => fireEvent(handle, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } }));
  expect(onSnapIndexChange).toHaveBeenLastCalledWith(1);
  expect(screen.getByRole('adjustable').props.accessibilityValue).toEqual({ text: '2 of 3' });
  act(() => fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } }));
  expect(onSnapIndexChange).toHaveBeenLastCalledWith(0);
});

test('accessibility steps stop at the first and last snap point and never dismiss', () => {
  const onSnapIndexChange = jest.fn();
  const onOpenChange = jest.fn();
  setup({ onOpenChange }, { snapPoints: [0.4, 0.8], onSnapIndexChange });
  act(() => fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } }));
  act(() => fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } }));
  act(() => fireEvent(screen.getByRole('adjustable'), 'accessibilityAction', { nativeEvent: { actionName: 'increment' } }));
  expect(onSnapIndexChange).toHaveBeenCalledTimes(1);
  expect(onOpenChange).not.toHaveBeenCalled();
});

test('a single-size sheet has no adjustable handle', () => {
  setup();
  expect(screen.queryByRole('adjustable')).toBeNull();
});
