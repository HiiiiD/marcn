import { render, fireEvent, screen } from '@testing-library/react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, type AccordionProps } from '@/registry/marcn/ui/accordion';

type Single = Omit<Extract<AccordionProps, { type: 'single' }>, 'type'>;
type Multiple = Omit<Extract<AccordionProps, { type: 'multiple' }>, 'type'>;

const items = (
  <>
    <AccordionItem value="a">
      <AccordionTrigger>First</AccordionTrigger>
      <AccordionContent>Alpha</AccordionContent>
    </AccordionItem>
    <AccordionItem value="b">
      <AccordionTrigger>Second</AccordionTrigger>
      <AccordionContent>Beta</AccordionContent>
    </AccordionItem>
    <AccordionItem value="c" disabled>
      <AccordionTrigger>Third</AccordionTrigger>
      <AccordionContent>Gamma</AccordionContent>
    </AccordionItem>
  </>
);

const single = (props: Single = {}) => render(<Accordion type="single" {...props}>{items}</Accordion>);
const multiple = (props: Multiple = {}) => render(<Accordion type="multiple" {...props}>{items}</Accordion>);
const trigger = (name: string) => screen.getByRole('button', { name });

test('single: opening one item closes the other', () => {
  single();
  fireEvent.press(trigger('First'));
  expect(trigger('First')).toBeExpanded();
  fireEvent.press(trigger('Second'));
  expect(trigger('Second')).toBeExpanded();
  expect(trigger('First')).toBeCollapsed();
});

test('single without collapsible cannot close the open item', () => {
  const onValueChange = jest.fn();
  single({ defaultValue: 'a', onValueChange });
  fireEvent.press(trigger('First'));
  expect(trigger('First')).toBeExpanded();
  expect(onValueChange).not.toHaveBeenCalled();
});

test('single with collapsible closes and reports an empty string', () => {
  const onValueChange = jest.fn();
  single({ defaultValue: 'a', collapsible: true, onValueChange });
  fireEvent.press(trigger('First'));
  expect(trigger('First')).toBeCollapsed();
  expect(onValueChange).toHaveBeenCalledWith('');
});

test('single controlled with an empty string renders everything closed', () => {
  single({ value: '' });
  expect(trigger('First')).toBeCollapsed();
  expect(trigger('Second')).toBeCollapsed();
  expect(screen.queryByText('Alpha')).toBeNull();
});

test('single controlled follows the value prop and only notifies on press', () => {
  const onValueChange = jest.fn();
  single({ value: 'b', onValueChange });
  expect(screen.getByText('Beta')).toBeOnTheScreen();
  fireEvent.press(trigger('First'));
  expect(onValueChange).toHaveBeenCalledWith('a');
  expect(trigger('Second')).toBeExpanded();
});

test('multiple: items open independently and report arrays', () => {
  const onValueChange = jest.fn();
  multiple({ onValueChange });
  fireEvent.press(trigger('First'));
  fireEvent.press(trigger('Second'));
  expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
  fireEvent.press(trigger('First'));
  expect(onValueChange).toHaveBeenLastCalledWith(['b']);
  expect(trigger('Second')).toBeExpanded();
});

test('multiple supports defaultValue', () => {
  multiple({ defaultValue: ['a', 'b'] });
  expect(screen.getByText('Alpha')).toBeOnTheScreen();
  expect(screen.getByText('Beta')).toBeOnTheScreen();
});

test('a disabled item cannot be opened', () => {
  single();
  fireEvent.press(trigger('Third'));
  expect(trigger('Third')).toBeCollapsed();
  expect(trigger('Third')).toBeDisabled();
});

test('disabled root disables every item', () => {
  single({ disabled: true });
  expect(trigger('First')).toBeDisabled();
});

test('string children of the trigger are wrapped in Text', () => {
  single();
  expect(screen.getByText('First')).toBeOnTheScreen();
});
