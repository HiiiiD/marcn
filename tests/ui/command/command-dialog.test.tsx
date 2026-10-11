import { useState } from 'react';
import { Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PortalHost } from '@/registry/marcn/ui/portal';
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/registry/marcn/ui/command';
import { mockBackHandler } from '../../back-handler';

beforeEach(() => {
  jest.useFakeTimers();
  mockBackHandler();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

function Harness({ onSelect }: { onSelect?: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <PortalHost>
      <Text onPress={() => setOpen(true)}>Open</Text>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandItem onSelect={(v) => { onSelect?.(v); setOpen(false); }}>Calendar</CommandItem>
          <CommandItem>Billing</CommandItem>
        </CommandList>
      </CommandDialog>
    </PortalHost>
  );
}

test('is closed until opened; the dialog is labelled and the input autofocuses', () => {
  render(<Harness />);
  expect(screen.queryByPlaceholderText('Type a command...')).toBeNull();
  fireEvent.press(screen.getByText('Open'));
  expect(screen.getByText('Command Palette')).toBeOnTheScreen();
  expect(screen.getByText('Search for a command to run...')).toBeOnTheScreen();
  expect(screen.getByPlaceholderText('Type a command...').props.autoFocus).toBe(true);
});

test('searching and selecting works, and the consumer closes it', () => {
  const onSelect = jest.fn((_: string) => {});
  render(<Harness onSelect={onSelect} />);
  fireEvent.press(screen.getByText('Open'));
  fireEvent.changeText(screen.getByPlaceholderText('Type a command...'), 'bill');
  expect(screen.queryByText('Calendar')).toBeNull();
  fireEvent.changeText(screen.getByPlaceholderText('Type a command...'), 'cal');
  fireEvent.press(screen.getByText('Calendar'));
  expect(onSelect).toHaveBeenCalledWith('Calendar');
  act(() => { jest.advanceTimersByTime(300); });
  expect(screen.queryByPlaceholderText('Type a command...')).toBeNull();
});

test('has no close button by default and honours title and description', () => {
  render(
    <PortalHost>
      <CommandDialog open title="Jump to" description="Pick a place">
        <CommandInput placeholder="q" />
      </CommandDialog>
    </PortalHost>,
  );
  expect(screen.queryByLabelText('Close')).toBeNull();
  expect(screen.getByText('Jump to')).toBeOnTheScreen();
  expect(screen.getByText('Pick a place')).toBeOnTheScreen();
});

test('showCloseButton adds the close button', () => {
  render(<PortalHost><CommandDialog open showCloseButton><CommandInput placeholder="q" /></CommandDialog></PortalHost>);
  expect(screen.getByLabelText('Close')).toBeOnTheScreen();
});
