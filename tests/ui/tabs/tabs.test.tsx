import { createRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/marcn/ui/tabs';
import { lightColors } from '@/registry/marcn/lib/theme';

function setup(props: Omit<React.ComponentProps<typeof Tabs>, 'children'> = { defaultValue: 'one' }, forceMount = false) {
  return render(
    <Tabs {...props}>
      <TabsList>
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three" disabled>
          Three
        </TabsTrigger>
      </TabsList>
      <TabsContent value="one">
        <Text>Panel one</Text>
      </TabsContent>
      <TabsContent value="two" forceMount={forceMount}>
        <Text>Panel two</Text>
      </TabsContent>
    </Tabs>,
  );
}

test('shows the default tab content and marks it selected', () => {
  setup();
  expect(screen.getByText('Panel one')).toBeOnTheScreen();
  expect(screen.queryByText('Panel two')).toBeNull();
  expect(screen.getByRole('tab', { name: 'One' })).toBeSelected();
  expect(screen.getByRole('tab', { name: 'Two' })).not.toBeSelected();
});

test('exposes a tablist', () => {
  setup();
  expect(screen.UNSAFE_getByProps({ accessibilityRole: 'tablist' })).toBeTruthy();
});

test('pressing a trigger switches the content', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'one', onValueChange });
  fireEvent.press(screen.getByRole('tab', { name: 'Two' }));
  expect(screen.getByText('Panel two')).toBeOnTheScreen();
  expect(screen.queryByText('Panel one')).toBeNull();
  expect(onValueChange).toHaveBeenCalledWith('two');
});

test('controlled: follows value, only notifies on press', () => {
  const onValueChange = jest.fn();
  setup({ value: 'one', onValueChange });
  fireEvent.press(screen.getByRole('tab', { name: 'Two' }));
  expect(onValueChange).toHaveBeenCalledWith('two');
  expect(screen.getByText('Panel one')).toBeOnTheScreen();
});

test('disabled trigger does nothing', () => {
  const onValueChange = jest.fn();
  setup({ defaultValue: 'one', onValueChange });
  fireEvent.press(screen.getByRole('tab', { name: 'Three' }));
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole('tab', { name: 'Three' })).toBeDisabled();
});

test('forceMount keeps inactive content mounted but hidden', () => {
  setup({ defaultValue: 'one' }, true);
  expect(screen.queryByText('Panel two')).toBeNull();
  expect(screen.getByText('Panel two', { includeHiddenElements: true })).toBeOnTheScreen();
});

test('a value with no matching trigger renders no content and does not crash', () => {
  setup({ defaultValue: 'missing' });
  expect(screen.queryByText('Panel one')).toBeNull();
  expect(screen.queryByText('Panel two')).toBeNull();
});

test('trigger text color follows the selected state', () => {
  setup();
  expect(screen.getByText('One')).toHaveStyle({ color: lightColors.foreground });
  expect(screen.getByText('Two')).toHaveStyle({ color: lightColors.mutedForeground });
});

test('trigger supports render element, function form and ref', () => {
  const ref = createRef<View>();
  const renderFn = jest.fn((props: object, _state?: unknown) => <Pressable testID="fn" {...props} />);
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a" ref={ref} render={renderFn}>
          A
        </TabsTrigger>
        <TabsTrigger value="b" render={<Pressable testID="el" />}>
          B
        </TabsTrigger>
      </TabsList>
    </Tabs>,
  );
  expect(screen.getByTestId('fn')).toBeOnTheScreen();
  expect(renderFn.mock.calls[0][1]).toEqual({ selected: true, disabled: false });
  expect(ref.current).not.toBeNull();
  expect(screen.getByTestId('el').props.accessibilityRole).toBe('tab');
});

test('parts throw outside Tabs', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => render(<TabsTrigger value="x">x</TabsTrigger>)).toThrow();
  jest.restoreAllMocks();
});
