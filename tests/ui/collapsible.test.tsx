import { createRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, type CollapsibleProps } from '@/registry/marcn/ui/collapsible';

function setup(props: CollapsibleProps = {}, contentProps: { forceMount?: boolean } = {}) {
  return render(
    <Collapsible {...props}>
      <CollapsibleTrigger>
        <Text>Toggle</Text>
      </CollapsibleTrigger>
      <CollapsibleContent {...contentProps}>
        <Text>Body</Text>
      </CollapsibleContent>
    </Collapsible>,
  );
}

afterEach(() => jest.useRealTimers());

test('is closed by default and the trigger reports collapsed', () => {
  setup();
  expect(screen.queryByText('Body')).toBeNull();
  expect(screen.getByRole('button')).toBeCollapsed();
});

test('pressing the trigger opens it', () => {
  setup();
  fireEvent.press(screen.getByRole('button'));
  expect(screen.getByText('Body')).toBeOnTheScreen();
  expect(screen.getByRole('button')).toBeExpanded();
});

test('defaultOpen starts open', () => {
  setup({ defaultOpen: true });
  expect(screen.getByText('Body')).toBeOnTheScreen();
});

test('controlled: notifies but only follows the open prop', () => {
  const onOpenChange = jest.fn();
  const { rerender } = setup({ open: false, onOpenChange });
  fireEvent.press(screen.getByRole('button'));
  expect(onOpenChange).toHaveBeenCalledWith(true);
  expect(screen.queryByText('Body')).toBeNull();
  rerender(
    <Collapsible open onOpenChange={onOpenChange}>
      <CollapsibleTrigger>
        <Text>Toggle</Text>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Text>Body</Text>
      </CollapsibleContent>
    </Collapsible>,
  );
  expect(screen.getByText('Body')).toBeOnTheScreen();
});

test('disabled blocks the trigger', () => {
  const onOpenChange = jest.fn();
  setup({ disabled: true, onOpenChange });
  fireEvent.press(screen.getByRole('button'));
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('button')).toBeDisabled();
});

test('unmounts content after the close animation', () => {
  jest.useFakeTimers();
  setup({ defaultOpen: true });
  fireEvent.press(screen.getByRole('button'));
  expect(screen.getByRole('button')).toBeCollapsed();
  act(() => jest.advanceTimersByTime(250));
  expect(screen.queryByText('Body')).toBeNull();
});

test('reopening inside the animation window keeps the content mounted', () => {
  jest.useFakeTimers();
  setup({ defaultOpen: true });
  fireEvent.press(screen.getByRole('button'));
  fireEvent.press(screen.getByRole('button'));
  act(() => jest.advanceTimersByTime(500));
  expect(screen.getByText('Body')).toBeOnTheScreen();
});

test('forceMount keeps closed content mounted but hidden from accessibility', () => {
  setup({}, { forceMount: true });
  expect(screen.queryByText('Body')).toBeNull();
  expect(screen.getByText('Body', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('trigger render function receives props and state; ref reaches the host', () => {
  const ref = createRef<View>();
  const renderFn = jest.fn((props: object) => <Pressable testID="custom" {...props} />);
  render(
    <Collapsible defaultOpen>
      <CollapsibleTrigger ref={ref} render={renderFn} />
    </Collapsible>,
  );
  expect(screen.getByTestId('custom')).toBeOnTheScreen();
  expect(renderFn.mock.calls[0][1]).toEqual({ open: true, disabled: false });
  expect(ref.current).not.toBeNull();
});

test('trigger render element form keeps the accessibility role', () => {
  render(
    <Collapsible>
      <CollapsibleTrigger render={<Pressable testID="el" />} />
    </Collapsible>,
  );
  expect(screen.getByTestId('el').props.accessibilityRole).toBe('button');
});

test('parts throw outside a Collapsible', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<CollapsibleTrigger />)).toThrow();
  jest.restoreAllMocks();
});
